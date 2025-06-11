import { useRef, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { TextDelta } from 'openai/resources/beta/threads/messages';
import styles from "../styles/home.module.css";
import { AssistantStream } from "openai/lib/AssistantStream";
import type { ChatMessage } from '../types/index';
import { getErrorMessage } from '../lib/misc';

export default function ChatBot() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Pick<ChatMessage, 'message' | 'type'>[];
    threadId?: string;
  }>({
    messages: [
      {
        message: 'Hi, what would you like to learn about Fer?',
        type: 'apiMessage',
      },
    ],
  });
  const [examplesQuestionModalOpen, setExamplesQuestionModalOpen] =
    useState<boolean>(false);

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // todo: fix
  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  // todo: fix this issue
  const appendToLastMessage = (text: string) => {
    if (messageState.messages.length === 0) {
      return;
    }

    setMessageState((prev) => {
      const latestMessageIsUserMessage =
        prev.messages.length > 0 &&
        prev.messages[prev.messages.length - 1]?.type === 'userMessage';

      // we need to check if the latest message is a user message
      // if so, we will append a new apiMessage with `text`
      // if the latest message is not a user message, we will append `text` to the latest apiMessage
      return {
        ...prev,
        messages: [
          ...prev.messages.slice(
            0,
            latestMessageIsUserMessage ? prev.messages.length : -1
          ),
          {
            type: 'apiMessage',
            message: latestMessageIsUserMessage
              ? text
              : `${prev.messages[prev.messages.length - 1]?.message}${text}`,
          },
        ],
      };
    });
  };

  const handleTextDelta = (delta: TextDelta) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
    }
  };

  // code from: https://github.com/openai/openai-assistants-quickstart/blob/main/app/components/chat.tsx
  const handleReadableStream = (stream: AssistantStream) => {
    // messages
    stream.on('textCreated', () => console.log('todo: textCreated Event'));
    stream.on('textDelta', handleTextDelta);

    // not required but might be useful in the future
    // image
    stream.on('imageFileDone', () => console.log('todo: imageFileDone Event'));

    // code interpreter
    stream.on('toolCallCreated', () => console.log('toolCallCreated Event'));
    stream.on('toolCallDelta', () => console.log('toolCallDelta Event'));

    // rest of the events
    stream.on('event', (event) => {
      // if (event.event === "thread.run.requires_action")
      //   handleRequiresAction(event);
      if (event.event === 'thread.run.completed') setLoading(false);
    });
  };

  // todo: accept modal option click event
  const handleSubmit = async (
    e?:
      | React.KeyboardEvent<HTMLTextAreaElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => {
    setError(null);
    if (!!e && 'key' in e && e.key === 'Enter') {
      if (e.key === 'Enter') {
        e.preventDefault();
      } else {
        return;
      }
    }

    const input = e?.currentTarget.value || textAreaRef.current?.value;

    if (!input || typeof input !== 'string') {
      setError('Please first enter a question.');

      return;
    }

    const question = input.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
      latestUserMessageIdx: state.messages.length,
    }));

    setLoading(true);
    // set text areaRef value to empty string
    textAreaRef.current && (textAreaRef.current.value = '');

    try {
      // won't use safeFetch helper with this stream request
      // stream are handled differently than normal requests
      const response = await fetch('/api/chat-v2', {
        method: 'POST',
        body: JSON.stringify({
          question,
          threadId: messageState.threadId,
        }),
      });

      const stream = AssistantStream.fromReadableStream(
        response.body as ReadableStream
      );

      handleReadableStream(stream);
    } catch (err: unknown) {
      const errMsg = getErrorMessage(err);

      setError(
        `An error occurred while fetching the data. Please try again. Error: ${errMsg}`
      );
      setLoading(false);

      return;
    }

    //scroll to bottom - broken - fix later
    messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
  };

  //prevent empty submissions
  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && textAreaRef.current?.value) {
      handleSubmit(e);
    } else if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleToggleExamplesQuestionModal = () => {
    setExamplesQuestionModalOpen((prev) => !prev);
  };

  const handleSetExampleQuestion = (
    question: string,
    toggleModal: boolean = true
  ) => {
    textAreaRef.current && (textAreaRef.current.value = question);
    if (toggleModal) {
      handleToggleExamplesQuestionModal();
    }
    handleSubmit();
  };

  return (
    <div className='mx-auto flex w-full flex-col gap-4'>
      {/* <AboutModal
        isOpen={examplesQuestionModalOpen}
        onClose={handleToggleExamplesQuestionModal}
        handleOptionClick={handleSetExampleQuestion}
      /> */}
      <div className='align-center justify-center'>
        <div
          ref={messageListRef}
          // className={styles.messagelist}
          id='chat-messages-list'
        >
          {messageState.messages.map((el, index) => {
            let icon;
            let className;

            if (el.type === 'apiMessage') {
              icon = (
                <img
                  key={index}
                  src='/bot-image.png'
                  alt='AI'
                  width='40'
                  height='40'
                  className={styles.boticon}
                  // priority
                />
              );
              className = styles.apimessage;
            } else {
              icon = (
                <img
                  key={index}
                  src='/usericon.png'
                  alt='Me'
                  width='30'
                  height='30'
                  className={styles.usericon}
                  // priority
                />
              );
              // The latest message sent by the user will be animated while waiting for a response
              className =
                loading && index === messageState.messages.length - 1
                  ? styles.usermessagewaiting
                  : styles.usermessage;
            }

            return (
              <div key={`chatMessage-${index}`}>
                <div className={className}>
                  {icon}
                  <div className='flex flex-col'>
                    <div
                      className={styles.markdownanswer}
                      id={`chat-message-${index}`}
                    >
                      <ReactMarkdown>
                      {/* <ReactMarkdown linkTarget='_blank'> */}
                        {el.message}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {!index ? (
                    <div className='relative flex w-full flex-col items-center justify-center text-sm text-gray-500'>
                      <button
                        onClick={() =>
                          handleSetExampleQuestion(
                            "What's Fer's Tech Stack?",
                            false
                          )
                        }
                      >
                        E.g: What&apos;s Fer&apos;s Tech Stack?
                      </button>
                      <button
                        onClick={handleToggleExamplesQuestionModal}
                        className='text-blue-500 hover:text-blue-700'
                      >
                        More Examples
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        <div className='relative flex w-full flex-col items-center justify-center py-2'>
          <div className='relative w-full'>
            <form>
              <textarea
                disabled={loading}
                onKeyDown={handleEnter}
                ref={textAreaRef}
                autoFocus={false}
                rows={1}
                maxLength={512}
                id='chat-user-input'
                name='chat-user-input'
                placeholder={
                  loading
                    ? 'Waiting for response...'
                    : 'Ask a question about Fer'
                }
                className={styles.textarea}
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={styles.generatebutton}
                id='chat-submit-button'
              >
                {loading ? (
                  <div className={styles.loadingwheel}>
                    {/* <LoadingDots color='#000' /> */}
                    ...
                  </div>
                ) : (
                  // Send icon SVG in input field
                  <svg
                    viewBox='0 0 20 20'
                    className={styles.svgicon}
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    {/* eslint-disable-next-line max-len */}
                    <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      {error ? (
        <div className='rounded-md border border-red-400 p-4'>
          <p className='text-red-500'>{error}</p>
        </div>
      ) : null}
    </div>
  );
}
