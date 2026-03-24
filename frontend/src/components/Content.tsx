/**
 * Landing page content panel that renders based on the active tab.
 *
 * Why tab-based rendering: Keeps the landing page lightweight by
 * showing only one content section at a time without client-side routing.
 */

interface ContentProps {
  activeTab: string;
}

const Content: React.FC<ContentProps> = ({ activeTab }) => {
  return (
    <div className="md:pt-10 leading-relaxed max-w-lg mx-auto px-4">
      {activeTab === "about" && (
        <div className="transition text-center">
          <p className="text-lg my-5 md:my-20 md:pl-10 space-y-1">
            <strong>Wait For It</strong> lets you send end-to-end encrypted
            notes that unlock at a time of your choosing. It's mystery, timing,
            and emotion — all wrapped in one. Whether it's a confession or
            surprise, your message stays private until the moment is right.
          </p>
        </div>
      )}
      {activeTab === "how it works" && (
        <div className="text-center">
          <ul className="text-lg md:my-25 md:pl-10 space-y-2">
            <li>Write your message – safely encrypted.</li>
            <li>Pick the reveal date and time.</li>
            <li>Send the link and build anticipation.</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Content;
