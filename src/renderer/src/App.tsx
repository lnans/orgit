import { AppHeader } from "./components/AppHeader";
import { Navbar } from "./components/NavBar";
import { Text } from "./components/Text";
import { TitleBarButtons } from "./components/TitleBarButtons";

function App(): React.JSX.Element {
	return (
		<div className="w-dvw h-dvh flex flex-col bg-background">
			<AppHeader />
			<div className="flex flex-1 h-dvh">
				<Navbar>
					<TitleBarButtons />
				</Navbar>
				<div className="w-full overflow-auto">
					<Text>Content</Text>
				</div>
			</div>
		</div>
	);
}

export default App;
