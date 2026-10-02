import { AppHeader } from "./components/AppHeader";
import { NavBarTitle, Navbar } from "./components/NavBar";
import { TitleBarButtons } from "./components/TitleBarButtons";

function App() {
	return (
		<div className="w-dvw h-dvh flex flex-col bg-background">
			<AppHeader />
			<TitleBarButtons />
			<div className="flex flex-1 h-dvh">
				<Navbar>
					<NavBarTitle title="Repositories" />
				</Navbar>
				<div className="w-full overflow-auto mt-7"></div>
			</div>
		</div>
	);
}

export default App;
