'use client';

import React, {
    createContext,
    Dispatch,
    FC,
    PropsWithChildren,
    SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react';
import {usePathname} from "next/navigation";

import {LAYOUT, Route} from "@/app/static";

import {checkSubRoute} from "@/app/utils";
import {useBreakpointCheck} from "@/app/hooks";
import {useUser} from "@/app/context/User.context";

// Main links, sub links, sub sub links
enum NavLink {Nav, SubNav, Sub2Nav}

type NavLinks = [Route[], Route [] | null, Route[] | null];


const NAV_LINKS: Route[] = [Route.About, Route.Products, Route.Service, Route.Contact];
const BREADCRUMBS_NAV_ROUTES: string[] = [Route.Documentation, Route.Credo, Route.ARCodeToolEdit, Route.Dot, Route.TernKey];


interface ILayoutContext {
    toggleFullscreen: () => void;
    isNoLayout: boolean;
    setMovingAnimationState: Dispatch<SetStateAction<boolean>>;
    isInsigniaMovedAnim: boolean;
    setInsigniaMoved: Dispatch<SetStateAction<boolean>>;
    isInsigniaMoved: boolean;
    setFadeState: Dispatch<SetStateAction<boolean>>;
    isFade: boolean;
    navLinks: NavLinks;
    isBreadCrumbsNav: boolean;
    getSubNavs: (route: Route) => [Route [] | null, Route[] | null];
}

const LayoutContext = createContext<ILayoutContext | null>(null);

const LayoutProvider: FC<PropsWithChildren> = (props: PropsWithChildren) => {
    const userCtx = useUser();
    const route = usePathname();
    const isSmScreen = useBreakpointCheck();

    const [isNoLayout, setNoLayoutState] = useState(false);
    const [isFade, setFadeState] = useState(false);

    const [isInsigniaMoved, setInsigniaMoved] = useState(false);
    const [isInsigniaMovedAnim, setMovingAnimationState] = useState(false);

    const fullscreenRef = useRef<HTMLDivElement | null>(null);


    const getSubNavs = (route: Route | null): [Route [] | null, Route[] | null] => {
        let subNavLinks: Route [] | null = [];
        let sub2NavLinks: Route [] | null = [];

        let links: Route[] = [];
        switch (route) {
            case Route.Documentation:
                subNavLinks = isSmScreen ? [Route.Documentation] : null;
                break;
            case Route.Credo:
                links = [Route.Credo];
                if (isSmScreen)
                    subNavLinks = links;
                else
                    sub2NavLinks = links;
                break;
            case Route.MyTern:
            case Route.Profile:
            case Route.Billing:
                sub2NavLinks = isSmScreen ? null : LAYOUT.profileLinks;
                break;
            case Route.Products:
                links = [Route.Products, Route.Dot, Route.TernKey];
                if (isSmScreen)
                    subNavLinks = links;
                else
                    sub2NavLinks = links;
                break;
            case Route.TernKeyPricing:
            case Route.TernKeyProductManual:
            case Route.TernKey:
                subNavLinks = [Route.Products, Route.Dot, Route.TernKey];
                sub2NavLinks = [Route.TernKey, Route.TernKeyPricing, Route.TernKeyProductManual];
                break;
            case Route.Dot:
            case Route.DotPricing:
            case Route.DotProductManual:
                subNavLinks = [Route.Products, Route.Dot, Route.TernKey];
                sub2NavLinks = [Route.Dot, Route.DotPricing, Route.DotProductManual];
                break;
            case Route.ARCHDoc:
            case Route.BTMCDoc:
            case Route.GDoc:
            case Route.TernDoc:
            case Route.TernKeyDoc:
            case Route.TernKitDoc:
                subNavLinks = [Route.Documentation];
                sub2NavLinks = isSmScreen
                    ? [route as Route]
                    : [
                        Route.ARCHDoc,
                        Route.BTMCDoc,
                        Route.GDoc,
                        Route.TernDoc,
                        Route.TernKeyDoc,
                        Route.TernKitDoc,
                    ];
                break;
            case Route.Service:
            case Route.ARCodeToolCreate:
            case Route.ServicePricing:
            case Route.SavedCodes:
            case Route.ServiceUserManual:
                links = [Route.Service, Route.ARCodeToolCreate, Route.ServicePricing, Route.ServiceUserManual];
                if (userCtx.userData) links.splice(links.length - 1, 0, Route.SavedCodes);

                if (isSmScreen)
                    subNavLinks = links;
                else
                    sub2NavLinks = links;
                break
        }

        return [subNavLinks, sub2NavLinks];
    }


    const navLinks: NavLinks = [NAV_LINKS, null, null];
    const isBreadCrumbsNav: boolean = BREADCRUMBS_NAV_ROUTES.some((subRoute) => checkSubRoute(route, subRoute));
    if (!isSmScreen && isBreadCrumbsNav) {
        switch (true) {
            case checkSubRoute(route, Route.Documentation):
                navLinks[NavLink.Nav] = [Route.MyTern, Route.Documentation];
                break;
            case checkSubRoute(route, Route.Credo):
                navLinks[NavLink.Nav] = [Route.About, Route.Credo];
                break;
            case checkSubRoute(route, Route.Dot):
                navLinks[NavLink.Nav] = [Route.Products, Route.Dot];
                break;
            case checkSubRoute(route, Route.TernKey):
                navLinks[NavLink.Nav] = [Route.Products, Route.TernKey];
                break;
            default:
                break;
        }
    } else if (route?.includes(Route.Profile) && isSmScreen)
        navLinks[NavLink.Nav] = LAYOUT.profileLinks;

    const subNavs = getSubNavs(route as Route);
    navLinks[NavLink.SubNav] = subNavs[0];
    navLinks[NavLink.Sub2Nav] = subNavs[1];


    useEffect(() => {
        if (sessionStorage.getItem('pip-mode-child') !== null)
            return handleNoLayoutState();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape')
                setNoLayoutState(false);
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleNoLayoutState = () => setNoLayoutState(document.fullscreenElement === null);

    const toggleFullscreen = () => {
        handleNoLayoutState();
        if (document.fullscreenElement)
            document.exitFullscreen();
        else
            fullscreenRef.current?.requestFullscreen();
    }

    return (
        <LayoutContext.Provider
            value={{
                toggleFullscreen,
                isNoLayout,
                setMovingAnimationState,
                isInsigniaMovedAnim,
                setInsigniaMoved,
                isInsigniaMoved,
                setFadeState,
                isFade,
                navLinks,
                isBreadCrumbsNav,
                getSubNavs,
            }}>
            <span ref={fullscreenRef}>
                {props.children}
            </span>
        </LayoutContext.Provider>
    );
};

const useLayout = (): ILayoutContext => {
    const context = useContext(LayoutContext);
    if (!context)
        throw new Error('useLayout must be used within a ModalProvider!');
    return context;
};

export type {NavLinks};
export {NavLink, LayoutProvider, useLayout}
