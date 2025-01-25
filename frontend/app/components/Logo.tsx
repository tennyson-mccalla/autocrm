export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top dashed circular path */}
      <path
        d="M12 3C16.9706 3 21 7.02944 21 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1 3"
      />
      {/* Bottom solid circular path */}
      <path
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Stylized 'A' */}
      <path
        d="M12 7L15.5 17H8.5L12 7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Horizontal line in 'A' */}
      <line
        x1="9.5"
        y1="14"
        x2="14.5"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
