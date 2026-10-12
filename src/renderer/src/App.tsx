import { AppHeader } from "./components/AppHeader";
import { Navbar } from "./components/NavBar";
import { TitleBarButtons } from "./components/TitleBarButtons";
import { RepositoriesList } from "./features/repositories/components/RepositoriesList";

function App() {
	return (
		<div className="w-dvw h-dvh flex flex-col bg-background">
			<AppHeader />
			<TitleBarButtons />
			<div className="flex flex-1 h-dvh">
				<Navbar>
					<RepositoriesList />
				</Navbar>
			</div>
		</div>
	);
}

export default App;
