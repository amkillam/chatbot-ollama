import {
    FC,
    KeyboardEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
  } from 'react';
  
  import { useTranslation } from 'next-i18next';
  
  import { DEFAULT_CONTEXT_WINDOW_SIZE } from '@/utils/app/const';
  
  import { Conversation } from '@/types/chat';
  
  import { ContextWindowSizeList } from './ContextWindowSizeList';
  import { ContextWindowModal } from './ContextWindowModal';
  
  interface Props {
    conversation: Conversation;
    contextWindowSizes: bigint[];
    onChangeContextWindowSize: (contextWindowSize: bigint) => void;
  }
  
  export const ContextWindowSize: FC<Props> = ({
    conversation,
    contextWindowSizes,
    onChangeContextWindowSize,
  }) => {
    const { t } = useTranslation('chat');
  
    const [value, setValue] = useState<bigint>(2048 as unknown as bigint);
    const [activeContextWindowSizeIndex, setActiveContextWindowSizeIndex] = useState(0);
    const [showContextWindowSizeList, setShowContextWindowSizeList] = useState(false);
    const [contextWindowSizeInputValue, setContextWindowSizeInputValue] = useState('');
    const [variables, setVariables] = useState<string[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
  
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const contextWindowSizeListRef = useRef<HTMLUListElement | null>(null);
  
    const filteredContextWindowSizes = contextWindowSizes.filter((contextWindowSize) =>
      contextWindowSize.toString().toLowerCase().includes(contextWindowSizeInputValue.toLowerCase()),
    );
  
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value as unknown as bigint;
  
      setValue(value);
  
      if (e.target.value.length > 0) {
        onChangeContextWindowSize(value);
      }
    };
  
    const handleInitModal = () => {
      const selectedContextWindowSize = filteredContextWindowSizes[activeContextWindowSizeIndex];
      setValue((prevVal) => {
        const newContent = prevVal?.toString().replace(/\/\w*$/, selectedContextWindowSize.toString());
        return newContent as unknown as bigint;
      });
      handleContextWindowSizeSelect(selectedContextWindowSize);
      setShowContextWindowSizeList(false);
    };
  
    const parseVariables = (content: string) => {
      const regex = /{{(.*?)}}/g;
      const foundVariables = [];
      let match;
  
      while ((match = regex.exec(content)) !== null) {
        foundVariables.push(match[1]);
      }
  
      return foundVariables;
    };
  
    const updateContextWindowSizeListVisibility = useCallback((text: string) => {
      const match = text.match(/\/\w*$/);
  
      if (match) {
        setShowContextWindowSizeList(true);
        setContextWindowSizeInputValue(match[0].slice(1));
      } else {
        setShowContextWindowSizeList(false);
        setContextWindowSizeInputValue('');
      }
    }, []);
  
    const handleContextWindowSizeSelect = (contextWindowSize: bigint) => {
      const parsedVariables = parseVariables(contextWindowSize.toString());
      setVariables(parsedVariables);
  
      if (parsedVariables.length > 0) {
        setIsModalVisible(true);
      } else {
        const updatedContent = value?.toString().replace(/\/\w*$/, contextWindowSize.toString()) as unknown as bigint;
  
        setValue(updatedContent);
        onChangeContextWindowSize(updatedContent);
  
        updateContextWindowSizeListVisibility(contextWindowSize.toString());
      }
    };
  
    const handleSubmit = (updatedVariables: string[]) => {
      const newContent = value?.toString().replace(/{{(.*?)}}/g, (match, variable) => {
        const index = variables.indexOf(variable);
        return updatedVariables[index];
      }) as unknown as bigint;
  
      setValue(newContent);
      onChangeContextWindowSize(newContent);
  
      if (textareaRef && textareaRef.current) {
        textareaRef.current.focus();
      }
    };

  
    useEffect(() => {
      if (textareaRef && textareaRef.current) {
        textareaRef.current.style.height = 'inherit';
        textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
      }
    }, [value]);
  
    useEffect(() => {
      if (conversation.contextWindowSize) {
        setValue(conversation.contextWindowSize);
      } else {
        setValue(DEFAULT_CONTEXT_WINDOW_SIZE);
      }
    }, [conversation]);
  
    useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (
          contextWindowSizeListRef.current &&
          !contextWindowSizeListRef.current.contains(e.target as Node)
        ) {
          setShowContextWindowSizeList(false);
        }
      };
  
      window.addEventListener('click', handleOutsideClick);
  
      return () => {
        window.removeEventListener('click', handleOutsideClick);
      };
    }, []);
  
    return (
      <div className="flex flex-col">
        <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
          {t('Context Window Size')}
        </label>
        <textarea
          ref={textareaRef}
          className="w-full rounded-lg border border-neutral-200 bg-transparent px-4 py-3 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100"
          style={{
            resize: 'none',
            bottom: `${textareaRef?.current?.scrollHeight}px`,
            maxHeight: '300px',
            overflow: `${
              textareaRef.current && textareaRef.current.scrollHeight > 400
                ? 'auto'
                : 'hidden'
            }`,
          }}
          placeholder={
            t(`Enter a numerical context window size, or leave blank for default (2048)`) || ''
          }
          value={t(value.toString()) || ''}
          rows={1}
          onChange={handleChange}
        />
  
        {showContextWindowSizeList && filteredContextWindowSizes.length > 0 && (
          <div>
            <ContextWindowSizeList
              activeContextWindowSizeIndex={activeContextWindowSizeIndex}
              contextWindowSizes={filteredContextWindowSizes}
              onSelect={handleInitModal}
              onMouseOver={setActiveContextWindowSizeIndex}
              contextWindowSizeListRef={contextWindowSizeListRef}
            />
          </div>
        )}
  
        {isModalVisible && (
          <ContextWindowModal
            contextWindowSize={contextWindowSizes[activeContextWindowSizeIndex]}
            variables={variables}
            onSubmit={handleSubmit}
            onClose={() => setIsModalVisible(false)}
          />
        )}
      </div>
    );
  };
  