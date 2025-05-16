import { useContext } from "react";
import { AuthContext } from "../AuthContext";

function NavBar() {
  const { token, logout } = useContext(AuthContext);

  return (
    <div className="flex items-center justify-between px-4 md:px-24 text-lg font-semibold fixed top-0 left-0 w-full bg-gray-900 text-white py-5 shadow-md z-50">
      <div className="flex items-center">
        <span className="rotate-90 pl-2 pt-1 pr-2 text-sm md:text-xl">/</span>
        <p className="text-2xl md:text-4xl font-bold ml-1 md:ml-2">
          SlashByHash
        </p>
      </div>

      {/* Show Logout button only if user is logged in */}
      {token && (
        <button
          onClick={logout}
          className="group relative flex justify-center py-1 px-5 border border-transparent text-md font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          type="button"
        >
          Logout
        </button>
      )}
    </div>
  );
}

export default NavBar;
