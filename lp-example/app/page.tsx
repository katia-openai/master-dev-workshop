const plants = [
  {
    name: "Cast iron plant",
    botanical: "Aspidistra elatior",
    detail: "12cm pot · 35–45cm tall",
    care: "Low light · Water when the top 4cm is dry",
    price: "£18",
  },
  {
    name: "Boston fern",
    botanical: "Nephrolepis exaltata",
    detail: "17cm pot · Full, trailing growth",
    care: "Soft light · Keep lightly moist",
    price: "£24",
  },
  {
    name: "Satin pothos",
    botanical: "Scindapsus pictus",
    detail: "15cm pot · 45–60cm trails",
    care: "Medium light · Easy-going",
    price: "£16",
  },
  {
    name: "Rubber plant",
    botanical: "Ficus elastica ‘Abidjan’",
    detail: "19cm pot · 75–90cm tall",
    care: "Bright indirect light · Pet caution",
    price: "£32",
  },
];

const workshops = [
  {
    date: "Sat 22 August",
    time: "10:30–12:00",
    name: "Repotting houseplants",
    detail: "Learn when to repot, mix compost and settle roots. Bring one plant up to a 20cm pot.",
    price: "£28 · 8 places",
  },
  {
    date: "Thu 3 September",
    time: "18:30–20:00",
    name: "Plants for lower light",
    detail: "Choose plants for north-facing rooms and learn how to spot when light is too low.",
    price: "£22 · 10 places",
  },
  {
    date: "Sun 13 September",
    time: "10:30–12:30",
    name: "Make a moss pole",
    detail: "Build a reusable coir and moss support for a climbing aroid. All materials are included.",
    price: "£36 · 8 places",
  },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Fern and Clay, home">
          <span>Fern</span><i>&amp;</i><span>Clay</span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#plants">Plants</a>
          <a href="#care">Plant care</a>
          <a href="#workshops">Workshops</a>
          <a href="#visit">Visit</a>
        </nav>
        <a className="header-cta" href="#visit">Plan your visit</a>
        <details className="mobile-nav">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            <a href="#plants">Plants</a>
            <a href="#care">Plant care</a>
            <a href="#workshops">Workshops</a>
            <a href="#visit">Visit</a>
          </nav>
        </details>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <img
            className="hero-image"
            src="/images/greenhouse-hero.webp"
            alt="Leafy plants lining a misted glass greenhouse at Fern and Clay"
            width="1536"
            height="1024"
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow light">Plant shop &amp; working greenhouse · Stoke Newington</p>
            <h1 id="hero-title">Houseplants grown under London glass.</h1>
            <p className="hero-copy">
              Hardy houseplants, honest care advice and small workshops from our greenhouse behind the shop.
            </p>
            <div className="button-row">
              <a className="button cream" href="#plants">See what’s in</a>
              <a className="text-link light-link" href="#visit">Opening hours <span aria-hidden="true">↘</span></a>
            </div>
          </div>
          <div className="hero-note" aria-label="Today’s opening information">
            <span className="status-dot" aria-hidden="true" />
            <div><strong>Open today</strong><span>10:00–18:00</span></div>
          </div>
        </section>

        <section className="intro section-pad" aria-labelledby="intro-title">
          <p className="eyebrow">The greenhouse on Church Street</p>
          <div className="intro-grid">
            <h2 id="intro-title">Plants chosen for the rooms Londoners actually live in.</h2>
            <div className="intro-copy">
              <p>
                We grow and acclimatise our plants in the old glasshouse behind the shop. That means they are used to soft light, cool nights and the occasional draught.
              </p>
              <p>
                Tell us which way your window faces, whether you have pets and how often you travel. We’ll help you leave with a plant that suits the space.
              </p>
            </div>
          </div>
        </section>

        <section className="stock-section section-pad" id="plants" aria-labelledby="plants-title">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Greenhouse list · 11 August</p>
              <h2 id="plants-title">Plants currently available</h2>
            </div>
            <p>Stock changes through the week. Call before travelling for a particular size.</p>
          </div>
          <div className="stock-layout">
            <figure className="image-frame bench-photo">
              <img
                src="/images/plant-bench.webp"
                alt="Ferns, cast iron plants and pothos arranged on a weathered greenhouse bench"
                width="1536"
                height="1024"
                loading="eager"
              />
              <figcaption>Benches 2–4 · shade-tolerant houseplants</figcaption>
            </figure>
            <div className="plant-list">
              {plants.map((plant) => (
                <article className="plant-row" key={plant.name}>
                  <div>
                    <h3>{plant.name}</h3>
                    <p className="botanical">{plant.botanical}</p>
                  </div>
                  <div className="plant-details">
                    <p>{plant.detail}</p>
                    <p>{plant.care}</p>
                  </div>
                  <p className="price">{plant.price}</p>
                </article>
              ))}
              <p className="list-note">We also have terracotta pots from £4, peat-free compost and saucers in seven sizes.</p>
            </div>
          </div>
        </section>

        <section className="care-section" id="care" aria-labelledby="care-title">
          <div className="care-lead section-pad">
            <p className="eyebrow light">Practical plant-care help</p>
            <h2 id="care-title">Bring us a leaf, a photo or the whole plant.</h2>
            <p>
              We’ll look at light, watering, pests and compost, then give you a short plan you can follow at home.
            </p>
            <a className="button terracotta" href="tel:+442079460284">Call the care desk</a>
          </div>
          <div className="care-options">
            <article>
              <span>01</span>
              <h3>Quick question</h3>
              <p>Bring clear photos and a fallen leaf to the counter. We’ll take a look while you browse.</p>
              <strong>Free · Tue–Fri, 11:00–16:00</strong>
            </article>
            <article>
              <span>02</span>
              <h3>Plant check-up</h3>
              <p>We inspect roots, identify common pests and write a care plan. Book ahead for plants over 60cm.</p>
              <strong>£8 · About 20 minutes</strong>
            </article>
            <article>
              <span>03</span>
              <h3>Repotting service</h3>
              <p>We supply the right peat-free mix and repot while you wait. Pots and compost are charged separately.</p>
              <strong>From £6 · Usually 30 minutes</strong>
            </article>
          </div>
        </section>

        <section className="workshop-section section-pad" id="workshops" aria-labelledby="workshops-title">
          <div className="workshop-layout">
            <div className="workshop-copy">
              <p className="eyebrow">At the back greenhouse</p>
              <h2 id="workshops-title">Small workshops around the potting table</h2>
              <p className="section-intro">Friendly, practical sessions with plenty of time for questions. Tea, tools and materials are included unless noted.</p>
              <div className="workshop-list">
                {workshops.map((workshop) => (
                  <article className="workshop-row" key={workshop.name}>
                    <div className="workshop-date">
                      <strong>{workshop.date}</strong>
                      <span>{workshop.time}</span>
                    </div>
                    <div>
                      <h3>{workshop.name}</h3>
                      <p>{workshop.detail}</p>
                      <strong className="workshop-price">{workshop.price}</strong>
                    </div>
                  </article>
                ))}
              </div>
              <a className="button green" href="mailto:hello@fernandclay.co.uk?subject=Workshop%20booking">Ask for a workshop place</a>
            </div>
            <figure className="image-frame workshop-photo">
              <img
                src="/images/potting-workshop.webp"
                alt="Four neighbours repotting leafy plants around a greenhouse workbench"
                width="1536"
                height="1024"
                loading="lazy"
              />
              <figcaption>Workshops are limited to 8–10 people</figcaption>
            </figure>
          </div>
        </section>

        <section className="delivery-strip" aria-labelledby="delivery-title">
          <div>
            <p className="eyebrow light">Local delivery</p>
            <h2 id="delivery-title">Plants brought to your door without the bus journey.</h2>
          </div>
          <div className="delivery-details">
            <p><strong>N16, N4 and E8</strong><span>Tuesday &amp; Friday rounds</span></p>
            <p><strong>£5 delivery</strong><span>Free on orders over £60</span></p>
            <p><strong>Book by 15:00</strong><span>For the next delivery day</span></p>
          </div>
          <a className="text-link light-link" href="tel:+442079460284">Order by phone <span aria-hidden="true">↗</span></a>
        </section>

        <section className="visit-section section-pad" id="visit" aria-labelledby="visit-title">
          <div className="visit-grid">
            <figure className="shopfront-photo">
              <img
                src="/images/shopfront.webp"
                alt="The dark green Fern and Clay shopfront on a wet London street"
                width="1024"
                height="1536"
                loading="eager"
              />
            </figure>
            <div className="visit-content">
              <p className="eyebrow">Come by the greenhouse</p>
              <h2 id="visit-title">Visit Fern &amp; Clay</h2>
              <address>
                128 Stoke Newington Church Street<br />
                London N16 0JU
              </address>
              <a className="text-link" href="https://www.google.com/maps/search/?api=1&query=Stoke+Newington+Church+Street+London" target="_blank" rel="noreferrer">Open in maps <span aria-hidden="true">↗</span></a>

              <div className="visit-details">
                <section aria-labelledby="hours-title">
                  <h3 id="hours-title">Opening hours</h3>
                  <dl className="hours-list">
                    <div><dt>Monday</dt><dd>Closed</dd></div>
                    <div><dt>Tuesday–Friday</dt><dd>10:00–18:00</dd></div>
                    <div><dt>Saturday</dt><dd>09:30–18:00</dd></div>
                    <div><dt>Sunday</dt><dd>11:00–16:00</dd></div>
                  </dl>
                </section>
                <section aria-labelledby="getting-here-title">
                  <h3 id="getting-here-title">Getting here</h3>
                  <p>Stoke Newington Overground is a 12-minute walk. Buses 73 and 476 stop on Church Street.</p>
                  <p>The shop entrance is step-free with an 84cm clear doorway. Please call ahead if you need help moving through the narrower greenhouse aisle.</p>
                </section>
              </div>

              <div className="contact-line">
                <a href="tel:+442079460284">020 7946 0284</a>
                <a href="mailto:hello@fernandclay.co.uk">hello@fernandclay.co.uk</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="wordmark footer-wordmark" href="#top" aria-label="Back to top">
          <span>Fern</span><i>&amp;</i><span>Clay</span>
        </a>
        <p>Independent plant shop &amp; working greenhouse<br />Stoke Newington, London</p>
        <div className="footer-links">
          <a href="mailto:hello@fernandclay.co.uk">Email</a>
          <a href="#visit">Hours &amp; directions</a>
          <a href="#top">Back to top ↑</a>
        </div>
        <small>© 2026 Fern &amp; Clay</small>
      </footer>
    </>
  );
}
