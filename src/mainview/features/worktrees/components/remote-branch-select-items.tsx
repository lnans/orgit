import {
	SelectGroup,
	SelectItem,
	SelectLabel,
} from "@client/components/ui/select";
import type { RemoteBranchOption } from "@shared/list-remote-branches";
import {
	groupRemoteBranchesByFolder,
	type RemoteBranchFolderNode,
	remoteBranchItemLabel,
} from "../lib/group-remote-branches-by-folder";

type RemoteBranchSelectItemsProps = {
	branches: RemoteBranchOption[];
};

function RemoteBranchFolderGroup({ node }: { node: RemoteBranchFolderNode }) {
	return (
		<>
			{node.branches.map((branch) => (
				<SelectItem key={branch.ref} value={branch.ref}>
					{remoteBranchItemLabel(branch)}
				</SelectItem>
			))}
			{node.children.map((child) => (
				<SelectGroup key={child.name}>
					<SelectLabel>{child.name}</SelectLabel>
					<RemoteBranchFolderGroup node={child} />
				</SelectGroup>
			))}
		</>
	);
}

/** Remote branch options grouped by `/` segments in the branch name. */
function RemoteBranchSelectItems({ branches }: RemoteBranchSelectItemsProps) {
	const tree = groupRemoteBranchesByFolder(branches);
	return <RemoteBranchFolderGroup node={tree} />;
}

export { RemoteBranchSelectItems };
