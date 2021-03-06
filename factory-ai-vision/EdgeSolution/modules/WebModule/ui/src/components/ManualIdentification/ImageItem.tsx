import React, { useState, useEffect, SetStateAction, Dispatch, FC, memo, useMemo } from 'react';
import { Dropdown, DropdownItemProps, Text, RadioGroup } from '@fluentui/react-northstar';
import LabelDisplayImage from '../LabelDisplayImage';
import LabelingPageDialog from '../LabelingPageDialog';
import { JudgedImageList, RelabelImage } from './types';

interface ImageIdentificationItemProps {
  confidenceLevel: number;
  relabelImages: RelabelImage[];
  imageIndex: number;
  setJudgedImageList: Dispatch<SetStateAction<JudgedImageList>>;
  partId: number;
  partItems: DropdownItemProps[];
  isPartCorrect: number;
}
const ImageIdentificationItem: FC<ImageIdentificationItemProps> = ({
  confidenceLevel,
  relabelImages,
  imageIndex,
  setJudgedImageList,
  partId,
  partItems,
  isPartCorrect,
}) => {
  const filteredPartItems = useMemo(
    () => [
      {
        header: 'No Object',
        content: {
          key: null,
        },
      },
      ...partItems.filter((e) => (e.content as { key: number }).key !== partId),
    ],
    [partId, partItems],
  );
  const [selectedPartItem, setSelectedPartItem] = useState<DropdownItemProps>(filteredPartItems[0]);

  const onDropdownChange = (_, { value }): void => {
    if (value !== null) {
      setSelectedPartItem(value);

      setJudgedImageList((prev) => {
        const next = [...prev];
        const idx = next.findIndex((e) => e.imageId === relabelImages[imageIndex].id);

        if (idx === -1) throw new Error("Image id doesn't match");
        next[idx] = { ...next[idx], partId: value.content.key };

        return next;
      });
    }
  };

  const onRadioGroupChange = (_, newProps): void => {
    setJudgedImageList((prev) => {
      const next = [...prev];

      if (newProps.value === 1) {
        const idx = next.findIndex((e) => e.imageId === relabelImages[imageIndex].id);

        if (idx >= 0) next[idx] = { ...next[idx], partId };
        else next.push({ imageId: relabelImages[imageIndex].id, partId });
      } else if (newProps.value === 0) {
        const idx = next.findIndex((e) => e.imageId === relabelImages[imageIndex].id);

        if (idx >= 0) next[idx] = { ...next[idx], partId: null };
        else {
          next.push({
            imageId: relabelImages[imageIndex].id,
            partId: null,
          });
        }
      }
      return next;
    });
  };

  useEffect(() => {
    setJudgedImageList([]);
    setSelectedPartItem(filteredPartItems[0]);
  }, [filteredPartItems, setSelectedPartItem, setJudgedImageList]);

  return (
    <div
      style={{
        minHeight: '16em',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <LabelingPageDialog
        imageIndex={imageIndex}
        images={relabelImages}
        isRelabel={true}
        trigger={
          <div
            style={{
              padding: '0.5em',
              height: '96%',
              flex: '1 0 0',
            }}
          >
            <LabelDisplayImage pointerCursor labelImage={relabelImages[imageIndex]} />
          </div>
        }
      />
      <div
        style={{
          height: '96%',
          maxHeight: '10em',
          flex: '1 0 0',
          display: 'flex',
          flexFlow: 'column',
          justifyContent: 'center',
        }}
      >
        <Text truncated>
          Confidence Level: <b>{confidenceLevel}%</b>
        </Text>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '50%',
            padding: '0.2em',
          }}
        >
          <RadioGroup
            checkedValue={isPartCorrect}
            onCheckedValueChange={onRadioGroupChange}
            items={[
              {
                key: '1',
                label: 'Yes',
                value: 1,
              },
              {
                key: '0',
                label: 'No',
                value: 0,
              },
            ]}
          />
          {isPartCorrect === 0 && filteredPartItems.length > 0 && (
            <div style={{ width: '50%' }}>
              <Dropdown
                fluid
                items={filteredPartItems}
                onChange={onDropdownChange}
                value={selectedPartItem}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ImageIdentificationItem);
