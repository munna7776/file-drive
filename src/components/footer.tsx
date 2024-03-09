import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="h-40 bg-gray-100 flex justify-between items-center mt-12 px-10 relative z-10">
      <div>FileDrive</div>
      <Link href="/" className="text-indigo-600 hover:text-indigo-500">
        Privacy Policy
      </Link>
      <Link href="/" className="text-indigo-600 hover:text-indigo-500">
        Terms Of Use
      </Link>
      <Link href="/" className="text-indigo-600 hover:text-indigo-500">
        About
      </Link>
    </footer>
  );
};
