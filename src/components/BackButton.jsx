import Link from 'next/link';
const BackButton = ({text,href}) => {
    return (
        <Link href={href}>
            <div className="text-blue-500 hover:underline flex items-center gap-2">
              <span>←</span>
              <span>{text}</span>
            </div>
        </Link>
    )
}

export default BackButton;
