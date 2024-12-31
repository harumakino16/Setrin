import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@/context/ThemeContext';

export default function HowToUseRequestModal({ isOpen, onClose }) {
  const { theme } = useTheme();
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                    リクエスト歌枠の使い方
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className={`bg-customTheme-${theme}-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5`}>1</span>
                    <div>
                      <p className="text-gray-800 font-medium">公開ページを選択</p>
                      <p className="text-sm text-gray-600">リクエストを受け付けたい公開ページを選択します</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className={`bg-customTheme-${theme}-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5`}>2</span>
                    <div>
                      <p className="text-gray-800 font-medium">リクエスト受付を開始</p>
                      <p className="text-sm text-gray-600">トグルボタンをオンにすると、リスナーからのリクエストを受け付けられます</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className={`bg-customTheme-${theme}-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5`}>3</span>
                    <div>
                      <p className="text-gray-800 font-medium">リクエストの管理</p>
                      <p className="text-sm text-gray-600">届いたリクエストを確認し、歌い終わったら消化ボタンを押して管理できます</p>
                    </div>
                  </div>

                  <div className={`mt-6 bg-customTheme-${theme}-secondary p-4 rounded-lg`}>
                    <p className="text-sm text-gray-800">
                      💡 ヒント：リスナー共有用URLをコピーして配信の説明欄などに貼り付けると、リスナーが簡単にリクエストできます
                    </p>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 