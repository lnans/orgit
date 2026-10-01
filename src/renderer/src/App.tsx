import { AppHeader } from "./components/AppHeader";
import { Text } from "./components/Text";

function App(): React.JSX.Element {
	return (
		<div className="w-dvw h-dvh flex flex-col bg-main">
			<AppHeader />
			<Text className="mt-7">Test of a text on main bg</Text>
		</div>
	);
}

export default App;
