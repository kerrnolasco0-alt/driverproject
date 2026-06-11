function SummaryCards() {

    const cards = [

        {
            title:
                "Total Miles",

            value:
                "3340.1"
        },

        {
            title:
                "Total Days",

            value:
                "6"
        },

        {
            title:
                "Fuel Stops",

            value:
                "3"
        },

        {
            title:
                "Driving Hours",

            value:
                "53.5"
        }
    ];

    return (

        <div
            className="card-grid"
        >

            {

                cards.map(
                    card => (

                        <div
                            key={card.title}
                            className="card"
                        >

                            <h3>
                                {card.title}
                            </h3>

                            <h1>
                                {card.value}
                            </h1>

                        </div>
                    )
                )

            }

        </div>
    );
}

export default SummaryCards;