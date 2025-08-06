import React, {FC} from "react";
import Image from "next/image";
import Spline from '@splinetool/react-spline';

import {Route} from "@/app/static";

import {useNavigate} from "@/app/hooks";

import SVG_INSIGNIA from '@/assets/images/insignia-logo.png'


interface Props {
    insigniaMoved?: boolean;
    className?: string;
}

const Insignia: FC<Props> = (props: Props) => {
    const {insigniaMoved, className} = props;

    const [navigate] = useNavigate();


    // 2 pre-rendered insignias for moving without flickering
    return (
        <div className={className}>
            {insigniaMoved
                ? (
                    <Image
                        src={SVG_INSIGNIA}
                        alt={'insignia'}
                        onClick={() => navigate(Route.Home)}
                        className={'w-full h-auto'}
                    />
                )
                : <Spline scene={"https://prod.spline.design/DVjbSoDcq5dzLgus/scene.splinecode"}/>}
        </div>
    );
}

export {Insignia};
