import MainNav from './navigation/MainNav';

export function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-gray-800">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-white text-xl font-semibold">AutoCRM</h1>
        </div>
        <div className="mt-5 flex-1 px-2">
          <MainNav />
        </div>
      </div>
    </div>
  );
}
