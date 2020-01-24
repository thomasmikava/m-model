import { useState, useEffect } from "react";

export interface IMountingInfo {
	isMounted: boolean;
	isFirstMounting: boolean;
	hasFinishedFirstMountingCycle: boolean;
}
export const useMountingInfo = (): IMountingInfo => {
	const isMounted = useState({
		isMounted: true,
		isFirstMounting: true,
		hasFinishedFirstMountingCycle: false,
	})[0];
	useEffect(() => {
		if (!isMounted.isFirstMounting) {
			isMounted.hasFinishedFirstMountingCycle = true;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isMounted.isFirstMounting]);
	useEffect(() => {
		isMounted.isMounted = true;
		isMounted.isFirstMounting = false;
		setTimeout(() => {
			isMounted.hasFinishedFirstMountingCycle = true;
		}, 0);
		return () => {
			isMounted.isMounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return isMounted;
};
