/**
 * Tab navigation for the landing page's right panel.
 *
 * Why a separate component: Keeps the tab switching logic and
 * active-state styling isolated from the content it controls.
 */

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TABS = ["about", "how it works"] as const;

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="mb-6 space-x-4 text-md justify-center md:justify-around flex flex-wrap">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`capitalize px-3 py-3 ease-in ${
            activeTab === tab ? "border-b-1" : "hover:cursor-pointer"
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
};

export default Sidebar;
