import { motion } from "framer-motion";
import { FC } from "react";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: FC<SidebarProps> = ({ isOpen }) => {
  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: isOpen ? 0 : -280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-full w-[280px] bg-gray-800 p-4 text-white"
    >
      {/* Sidebar content */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Chat History</h2>
        {/* Add your sidebar content here */}
      </div>
    </motion.div>
  );
};

export default Sidebar; 