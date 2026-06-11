import {
    useState
} from "react";

import {
    generateTrip
}
from "../../api/tripApi";

import {
    useTrip
}
from "../../context/TripContext";


function TripForm() {

    const {
        setTrip
    } = useTrip();

    const [form,
        setForm] =
        useState({

            current_location:
                "",

            pickup_location:
                "",

            dropoff_location:
                "",

            cycle_used:
                0
        });

    async function submit() {

        const result =
            await generateTrip(
                form
            );

        setTrip(
            result
        );

        console.log(
            result
        );
    }

    return (

        <div>

            <input

                placeholder="Current Location"

                onChange={(e) =>
                    setForm({
                        ...form,

                        current_location:
                            e.target.value
                    })
                }
            />

            <br />

            <input

                placeholder="Pickup Location"

                onChange={(e) =>
                    setForm({
                        ...form,

                        pickup_location:
                            e.target.value
                    })
                }
            />

            <br />

            <input

                placeholder="Dropoff Location"

                onChange={(e) =>
                    setForm({
                        ...form,

                        dropoff_location:
                            e.target.value
                    })
                }
            />

            <br />

            <input

                type="number"

                placeholder="Cycle Used"

                onChange={(e) =>
                    setForm({
                        ...form,

                        cycle_used:
                            Number(
                                e.target.value
                            )
                    })
                }
            />

            <br />

            <button
                onClick={submit}
            >

                Generate Trip

            </button>

        </div>
    );
}

export default TripForm;