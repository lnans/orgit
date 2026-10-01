import { AppHeader } from "./components/AppHeader";
import { Navbar } from "./components/NavBar";
import { Text } from "./components/Text";

function App(): React.JSX.Element {
	return (
		<div className="w-dvw h-dvh flex flex-col bg-main">
			<AppHeader />
			<div className="flex flex-1 h-dvh">
				<Navbar>
					<Text>Content</Text>
				</Navbar>
				<div className="w-full overflow-auto">content</div>
			</div>
		</div>
	);
}

export default App;
