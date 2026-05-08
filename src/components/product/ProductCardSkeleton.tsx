export default function ProductCardSkeleton() {
  return (
    <div className="flex h-full cursor-default flex-col">
      {/* Image Skeleton */}
      <div className="bg-muted relative mb-4 aspect-square overflow-hidden rounded-xl">
        <div className="shimmer absolute inset-0" />
      </div>

      {/* Info Skeleton */}
      <div className="flex flex-1 flex-col space-y-3">
        <div className="space-y-2">
          <div className="bg-muted shimmer h-5 w-3/4 rounded-lg" />
          <div className="bg-muted shimmer h-5 w-1/2 rounded-lg" />
        </div>
        <div className="bg-muted shimmer h-8 w-2/3 rounded-lg" />
      </div>
    </div>
  );
}
