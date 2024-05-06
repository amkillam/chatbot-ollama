import { FC, MutableRefObject } from 'react';

interface Props {
  contextWindowSizes: bigint[];
  activeContextWindowSizeIndex: number;
  onSelect: () => void;
  onMouseOver: (index: number) => void;
  contextWindowSizeListRef: MutableRefObject<HTMLUListElement | null>;
}

export const ContextWindowSizeList: FC<Props> = ({
  contextWindowSizes,
  activeContextWindowSizeIndex,
  onSelect,
  onMouseOver,
  contextWindowSizeListRef,
}) => {
  return (
    <ul
      ref={contextWindowSizeListRef}
      className="z-10 max-h-52 w-full overflow-scroll rounded border border-black/10 bg-white shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:border-neutral-500 dark:bg-[#343541] dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]"
    >
      {contextWindowSizes.map((contextWindowSize, index) => (
        <li
          key={contextWindowSizes.indexOf(contextWindowSize) + 1}
          className={`${
            index === activeContextWindowSizeIndex
              ? 'bg-gray-200 dark:bg-[#202123] dark:text-black'
              : ''
          } cursor-pointer px-3 py-2 text-sm text-black dark:text-white`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect();
          }}
          onMouseEnter={() => onMouseOver(index)}
        >
          {contextWindowSize.toString()}
        </li>
      ))}
    </ul>
  );
};
