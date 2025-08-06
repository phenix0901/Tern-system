import {useBreakpointCheck} from "./useBreakpointCheck";
import {useModal} from "@/app/context";

import {MenuModal} from "@/app/ui/modals";


const useMenu = (isSingleSubLink?: boolean): [() => void, () => void] => {
    const modalCtx = useModal();
    const isSmScreen = useBreakpointCheck();

    const openMenu = () => {
        if (isSmScreen)
            modalCtx.openModal(<MenuModal isSingleSubLink={isSingleSubLink}/>, {doFading: false});
    }

    const closeMenu = () => {
        if (isSmScreen)
            modalCtx.closeModal();
    }

    return [openMenu, closeMenu];
}


export {useMenu};
