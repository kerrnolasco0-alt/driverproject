import {
    createContext,
    useContext,
    useState
} from "react";

const TripContext =
    createContext();

export function TripProvider({
    children
}) {

    const [trip,
        setTrip] =
        useState(null);

    return (

        <TripContext.Provider
            value={{
                trip,
                setTrip
            }}
        >

            {children}

        </TripContext.Provider>
    );
}

export function useTrip() {

    return useContext(
        TripContext
    );
}