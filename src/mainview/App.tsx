import { AppHeader } from "./components/AppHeader";
import { Navbar } from "./components/Navbar";
import { RepositoryList } from "./features/repositories/components/RepositoryList";

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
