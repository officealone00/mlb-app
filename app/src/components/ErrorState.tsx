interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "데이터를 불러올 수 없어요", onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-3">⚾</div>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-mlbBlue text-white rounded-full text-sm font-medium"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
