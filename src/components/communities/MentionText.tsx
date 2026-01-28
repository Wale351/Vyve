import { Link } from 'react-router-dom';
import { Fragment } from 'react';

interface MentionTextProps {
  content: string;
  className?: string;
}

// Regex to match @username mentions
const MENTION_REGEX = /@([a-zA-Z0-9_]+)/g;

const MentionText = ({ content, className }: MentionTextProps) => {
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  // Reset regex state
  MENTION_REGEX.lastIndex = 0;

  while ((match = MENTION_REGEX.exec(content)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    // Add the mention as a link
    const username = match[1];
    parts.push(
      <Link
        key={`${match.index}-${username}`}
        to={`/profile/${username}`}
        className="text-primary hover:underline font-medium"
      >
        @{username}
      </Link>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last mention
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return (
    <span className={className}>
      {parts.map((part, index) => (
        <Fragment key={index}>{part}</Fragment>
      ))}
    </span>
  );
};

export default MentionText;
