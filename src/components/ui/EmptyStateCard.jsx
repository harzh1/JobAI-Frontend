export default function EmptyStateCard({
  icon: Icon,
  title,
  description,
  action,
  className = "",
  iconSize = 32,
}) {
  return (
    <div
      className={`
        col-span-full
        w-full
        flex flex-col items-center justify-center
        rounded-2xl border-2 border-dashed
        border-gray-200 bg-gray-50
        py-12 text-center
        text-gray-500
        ${className}
      `}
    >
      {Icon && (
        <Icon
          size={iconSize}
          className="mb-3 text-gray-400"
        />
      )}

      <h3 className="font-bold text-gray-900">
        {title}
      </h3>

      {description && (
        <p className="mt-1 text-sm text-gray-500 max-w-md">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}
