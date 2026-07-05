import { AppHeader } from "./components/ui/AppHeader";
import { Navbar } from "./components/ui/Navbar";
import { RepositoryList } from "./features/repositories/RepositoryList";

export default function App() {
	return (
		<div className="w-dvw h-dvh flex flex-col bg-main">
			<AppHeader />
			<div className="flex flex-1 h-dvh">
				<Navbar>
					<RepositoryList />
				</Navbar>
				<div className="w-full overflow-auto">content</div>
			</div>
		</div>
	);
}
