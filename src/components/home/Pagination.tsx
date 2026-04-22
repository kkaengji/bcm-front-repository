interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i).map((page) => {
        // 현재 페이지 주변만 표시 (처음, 끝, 현재 ±2)
        if (
          page === 0 ||
          page === totalPages - 1 ||
          (page >= currentPage - 2 && page <= currentPage + 2)
        ) {
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-8 px-2 py-1 text-sm transition-colors ${
                currentPage === page
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {page + 1}
            </button>
          );
        } else if (page === currentPage - 3 || page === currentPage + 3) {
          return (
            <span key={page} className="text-muted-foreground px-1 text-sm">
              ...
            </span>
          );
        }
        return null;
      })}
    </div>
  );
}
