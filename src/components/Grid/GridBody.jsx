import { memo } from "react";
import GridRow from "./GridRow";

function GridBody({

    ids,

    topSpacer,

    bottomSpacer

}){

    return(

        <>

            <div
                style={{
                    height:topSpacer
                }}
            />

            {

                ids.map(id=>(

                    <GridRow

                        key={id}

                        id={id}

                    />

                ))

            }

            <div
                style={{
                    height:bottomSpacer
                }}
            />

        </>

    );

}

export default memo(GridBody);