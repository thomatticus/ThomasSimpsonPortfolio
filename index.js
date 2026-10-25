/* ========================================
   ELEMENTS
========================================= */

const viewport =
  document.querySelector(".panel-viewport");

const panels =
  Array.from(
    document.querySelectorAll(".portfolio-panel")
  );

const navLinks =
  Array.from(
    document.querySelectorAll(".site-nav__link")
  );

const jumpLinks =
  Array.from(
    document.querySelectorAll("[data-jump-section]")
  );

const lights = {
  lavender: document.querySelector(
    ".mountain-light--lavender"
  ),

  rose: document.querySelector(
    ".mountain-light--rose"
  ),

  hotpink: document.querySelector(
    ".mountain-light--hotpink"
  ),

  orange: document.querySelector(
    ".mountain-light--orange"
  ),

  peach: document.querySelector(
    ".mountain-light--peach"
  ),

  white: document.querySelector(
    ".mountain-light--white"
  )
};

const mobileBreakpoint = 700;


/* ========================================
   SUNRISE STATES
========================================= */

const sunriseStates = {
  home: {
    lavender: 0.65,
    rose: 0.45,
    hotpink: 0.18,
    orange: 0.15,
    peach: 0.05,
    white: 0.01
  },

  about: {
    lavender: 0.35,
    rose: 0.70,
    hotpink: 0.38,
    orange: 0.20,
    peach: 0.08,
    white: 0.02
  },

  projects: {
    lavender: 0.15,
    rose: 0.45,
    hotpink: 0.44,
    orange: 0.60,
    peach: 0.25,
    white: 0.05
  },

  "projects-late": {
    lavender: 0.10,
    rose: 0.30,
    hotpink: 0.34,
    orange: 0.68,
    peach: 0.36,
    white: 0.07
  },

  languages: {
    lavender: 0.08,
    rose: 0.20,
    hotpink: 0.25,
    orange: 0.70,
    peach: 0.45,
    white: 0.10
  }
};


/* ========================================
   HELPERS
========================================= */

function isDesktop() {
  return window.innerWidth > mobileBreakpoint;
}

function clamp(value, min, max) {
  return Math.min(
    Math.max(value, min),
    max
  );
}

function mix(start, end, progress) {
  return (
    start +
    (end - start) * progress
  );
}


/* ========================================
   GET CURRENT PANEL POSITION
========================================= */

function getPanelInformation() {
  return panels.map((panel) => {
    return {
      panel,

      start:
        panel.offsetLeft,

      width:
        panel.offsetWidth,

      center:
        panel.offsetLeft +
        panel.offsetWidth / 2,

      section:
        panel.dataset.section,

      lightState:
        panel.dataset.lightState ||
        "home"
    };
  });
}


/* ========================================
   ACTIVE NAVIGATION
========================================= */

function updateNavigation() {

  const panelData =
    getPanelInformation();

  const viewportCenter =
    viewport.scrollLeft +
    viewport.clientWidth / 2;

  let active =
    panelData[0];

  let smallestDistance =
    Infinity;

  panelData.forEach((item) => {
    const distance =
      Math.abs(
        viewportCenter -
        item.center
      );

    if (
      distance <
      smallestDistance
    ) {
      smallestDistance =
        distance;

      active =
        item;
    }
  });

  navLinks.forEach((link) => {
    const matches =
      link.dataset.targetSection ===
      active.section;

    link.classList.toggle(
      "active",
      matches
    );
  });
}


/* ========================================
   CONTINUOUS SUNRISE
========================================= */

function updateSunrise() {

  const panelData =
    getPanelInformation();

  if (
    panelData.length === 0
  ) {
    return;
  }

  const viewportCenter =
    viewport.scrollLeft +
    viewport.clientWidth / 2;

  if (
    viewportCenter <=
    panelData[0].center
  ) {
    applyExactState(
      panelData[0].lightState
    );

    return;
  }

  for (
    let i = 0;
    i < panelData.length - 1;
    i++
  ) {
    const current =
      panelData[i];

    const next =
      panelData[i + 1];

    if (
      viewportCenter >=
        current.center &&

      viewportCenter <=
        next.center
    ) {
      const distance =
        next.center -
        current.center;

      let progress =
        (
          viewportCenter -
          current.center
        ) /
        distance;

      progress =
        clamp(
          progress,
          0,
          1
        );

      /*
        Smoothstep keeps the sunrise
        transition soft rather than linear.
      */

      progress =
        progress *
        progress *
        (
          3 -
          2 * progress
        );

      blendStates(
        current.lightState,
        next.lightState,
        progress
      );

      return;
    }
  }

  applyExactState(
    panelData[
      panelData.length - 1
    ].lightState
  );
}


/* ========================================
   APPLY EXACT LIGHTING
========================================= */

function applyExactState(
  stateName
) {
  const state =
    sunriseStates[stateName];

  if (!state) {
    return;
  }

  Object.keys(
    lights
  ).forEach((name) => {
    if (!lights[name]) {
      return;
    }

    lights[name].style.opacity =
      state[name];
  });
}


/* ========================================
   BLEND TWO LIGHTING STATES
========================================= */

function blendStates(
  firstName,
  secondName,
  progress
) {
  const first =
    sunriseStates[firstName];

  const second =
    sunriseStates[secondName];

  if (
    !first ||
    !second
  ) {
    return;
  }

  Object.keys(
    lights
  ).forEach((name) => {
    const element =
      lights[name];

    if (!element) {
      return;
    }

    element.style.opacity =
      mix(
        first[name],
        second[name],
        progress
      );
  });
}


/* ========================================
   UPDATE PORTFOLIO
========================================= */

function updatePortfolio() {
  updateNavigation();
  updateSunrise();
}


/* ========================================
   VERTICAL WHEEL →
   HORIZONTAL SCROLL
========================================= */

viewport.addEventListener(
  "wheel",
  (event) => {
    if (!isDesktop()) {
      return;
    }

    const amount =
      Math.abs(event.deltaX) >
      Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;

    event.preventDefault();

    viewport.scrollLeft +=
      amount;
  },
  {
    passive: false
  }
);


/* ========================================
   SCROLL
========================================= */

viewport.addEventListener(
  "scroll",
  () => {
    window.requestAnimationFrame(
      updatePortfolio
    );
  },
  {
    passive: true
  }
);


/* ========================================
   GO TO SECTION
========================================= */

function goToSection(
  sectionName
) {
  const section =
    document.getElementById(
      sectionName
    );

  if (!section) {
    return;
  }

  viewport.scrollTo({
    left:
      section.offsetLeft,

    behavior:
      "smooth"
  });
}


/* ========================================
   NAVIGATION LINKS
========================================= */

navLinks.forEach((link) => {
  link.addEventListener(
    "click",
    (event) => {
      event.preventDefault();

      goToSection(
        link.dataset.targetSection
      );
    }
  );
});


/* ========================================
   INTERNAL JUMP LINKS
========================================= */

jumpLinks.forEach((link) => {
  link.addEventListener(
    "click",
    (event) => {
      event.preventDefault();

      goToSection(
        link.dataset.jumpSection
      );
    }
  );
});


/* ========================================
   ARROW KEYS
========================================= */

window.addEventListener(
  "keydown",
  (event) => {
    if (!isDesktop()) {
      return;
    }

    if (
      event.key ===
      "ArrowRight"
    ) {
      event.preventDefault();

      viewport.scrollBy({
        left:
          viewport.clientWidth *
          0.72,

        behavior:
          "smooth"
      });
    }

    if (
      event.key ===
      "ArrowLeft"
    ) {
      event.preventDefault();

      viewport.scrollBy({
        left:
          -viewport.clientWidth *
          0.72,

        behavior:
          "smooth"
      });
    }
  }
);


/* ========================================
   RESIZE
========================================= */


window.addEventListener(
  "resize",
  () => {
    updatePortfolio();
  }
);



/* ========================================
   INITIALIZE PORTFOLIO
========================================= */

window.addEventListener(
  "load",
  () => {
    viewport.scrollLeft = 0;

    applyExactState(
      "home"
    );

    updatePortfolio();
  }
);


/* ========================================
   REAL MT. RAINIER → CODE
========================================= */

(() => {

  const about =
    document.querySelector("#about");

  const scroller =
    document.querySelector(".panel-viewport");

  const terrain =
    document.querySelector(
      ".rainier-system__terrain"
    );

  if (
    !about ||
    !scroller ||
    !terrain
  ) {
    return;
  }


  /* ======================================
     RAINIER GEOGRAPHIC AREA
  ====================================== */

  const bounds = {
    west: -121.865,
    south: 46.775,
    east: -121.655,
    north: 46.955
  };

  const viewBox = {
    width: 760,
    height: 560
  };


  /* ======================================
     USGS CONTOUR SERVICE
  ====================================== */

  const endpoint =
    "https://cartowfs.nationalmap.gov/arcgis/rest/services/contours/FeatureServer/5/query";


  /* ======================================
     PROJECT LONGITUDE / LATITUDE
     INTO SVG
  ====================================== */

  function projectPoint(
    longitude,
    latitude
  ) {

    const x =
      (
        (
          longitude -
          bounds.west
        ) /
        (
          bounds.east -
          bounds.west
        )
      ) *
      viewBox.width;


    const y =
      viewBox.height -
      (
        (
          latitude -
          bounds.south
        ) /
        (
          bounds.north -
          bounds.south
        )
      ) *
      viewBox.height;


    return [x, y];
  }


  /* ======================================
     COORDINATES → SVG PATH
  ====================================== */

  function coordinatesToPath(
    coordinates
  ) {

    return coordinates
      .map(
        (
          point,
          index
        ) => {

          const [x, y] =
            projectPoint(
              point[0],
              point[1]
            );

          const command =
            index === 0
              ? "M"
              : "L";

          return (
            `${command} ` +
            `${x.toFixed(2)} ` +
            `${y.toFixed(2)}`
          );
        }
      )
      .join(" ");
  }


  /* ======================================
     CONTROL VISUAL DENSITY
  ====================================== */

  function shouldDrawContour(
    elevation,
    fcode
  ) {

    /*
      Keep official index contours.
    */

    if (fcode === 10102) {
      return true;
    }


    /*
      Draw 200-foot intervals.

      Still real USGS geometry without
      dumping every contour onto the page.
    */

    return (
      Number.isFinite(elevation) &&
      Math.abs(
        elevation % 200
      ) < 0.01
    );
  }


  /* ======================================
     CREATE CONTOUR PATH
  ====================================== */

  function createContour(
    coordinates,
    properties
  ) {

    const elevation =
      Number(
        properties.contourelevation ??
        properties.CONTOURELEVATION ??
        0
      );


    const fcode =
      Number(
        properties.fcode ??
        properties.FCODE ??
        0
      );


    if (
      !shouldDrawContour(
        elevation,
        fcode
      )
    ) {
      return null;
    }


    const path =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );


    path.setAttribute(
      "d",
      coordinatesToPath(
        coordinates
      )
    );


    path.classList.add(
      "rainier-system__contour"
    );


    if (fcode === 10102) {

      path.classList.add(
        "rainier-system__contour--index"
      );
    }


    if (elevation >= 11000) {

      path.classList.add(
        "rainier-system__contour--summit"
      );
    }


    return path;
  }


  /* ======================================
     ADD CONTOUR
  ====================================== */

  function addContour(
    coordinates,
    properties
  ) {

    const path =
      createContour(
        coordinates,
        properties
      );


    if (!path) {
      return;
    }


    terrain.appendChild(path);
  }


  /* ======================================
     RENDER USGS GEOJSON
  ====================================== */

  function renderContours(data) {

    terrain.innerHTML = "";


    if (
      !Array.isArray(
        data?.features
      )
    ) {
      return;
    }


    data.features.forEach(
      (feature) => {

        const geometry =
          feature.geometry;


        if (!geometry) {
          return;
        }


        const properties =
          feature.properties || {};


        if (
          geometry.type ===
          "LineString"
        ) {

          addContour(
            geometry.coordinates,
            properties
          );
        }


        else if (
          geometry.type ===
          "MultiLineString"
        ) {

          geometry.coordinates.forEach(
            (line) => {

              addContour(
                line,
                properties
              );
            }
          );
        }
      }
    );
  }


  /* ======================================
     LOAD ACTUAL RAINIER CONTOURS
  ====================================== */

  async function loadRainier() {

    const params =
      new URLSearchParams({

        where:
          "contourunits = 1 AND contourelevation >= 5000",

        geometry: [
          bounds.west,
          bounds.south,
          bounds.east,
          bounds.north
        ].join(","),

        geometryType:
          "esriGeometryEnvelope",

        spatialRel:
          "esriSpatialRelIntersects",

        inSR:
          "4326",

        outSR:
          "4326",

        outFields:
          "contourelevation,contourunits,fcode",

        returnGeometry:
          "true",

        f:
          "geojson",

        resultRecordCount:
          "2000"
      });


    try {

      const response =
        await fetch(
          `${endpoint}?${params.toString()}`
        );


      if (!response.ok) {

        throw new Error(
          `USGS request failed: ${response.status}`
        );
      }


      const data =
        await response.json();


      renderContours(data);
    }


    catch (error) {

      console.warn(
        "Mount Rainier contour data could not load.",
        error
      );
    }
  }


  /* ======================================
     HELPER
  ====================================== */

  function clampRainier(
    value,
    min,
    max
  ) {

    return Math.min(
      Math.max(
        value,
        min
      ),
      max
    );
  }


  /* ======================================
     HORIZONTAL SCROLL →
     RAINIER / CODE TRANSFORMATION
  ====================================== */

  function updateRainier() {

    const viewportWidth =
      scroller.clientWidth;


    const aboutStart =
      about.offsetLeft;


    const currentScroll =
      scroller.scrollLeft;


    /*
      Begin while About enters.
    */

    const start =
      aboutStart -
      viewportWidth * 0.72;


    /*
      Finish shortly after About
      reaches the viewport.
    */

    const end =
      aboutStart +
      viewportWidth * 0.26;


    const rawProgress =
      (
        currentScroll -
        start
      ) /
      (
        end -
        start
      );


    const progress =
      clampRainier(
        rawProgress,
        0,
        1
      );


    /*
      Smoothstep gives the transformation
      its soft, non-mechanical movement.
    */

    const eased =
      progress *
      progress *
      (
        3 -
        2 * progress
      );


    about.style.setProperty(
      "--rainier-progress",
      eased.toFixed(4)
    );
  }


  /* ======================================
     RAF PERFORMANCE
  ====================================== */

  let ticking = false;


  function requestRainierUpdate() {

    if (ticking) {
      return;
    }


    ticking = true;


    requestAnimationFrame(
      () => {

        updateRainier();

        ticking = false;
      }
    );
  }


  /* ======================================
     EVENTS
  ====================================== */

  scroller.addEventListener(
    "scroll",
    requestRainierUpdate,
    {
      passive: true
    }
  );


  window.addEventListener(
    "resize",
    requestRainierUpdate
  );


  /* ======================================
     START
  ====================================== */

  loadRainier();

  updateRainier();

})();



/* ========================================
   LANGUAGES HORIZON LIGHT
========================================= */

(() => {
  const horizon =
    document.querySelector(
      ".language-horizon"
    );

  const horizonLine =
    document.querySelector(
      ".language-horizon__line"
    );

  const atmosphere =
    document.querySelector(
      ".language-horizon__atmosphere"
    );

  const languages =
    document.querySelectorAll(
      ".language"
    );

  if (
    !horizon ||
    !horizonLine ||
    !atmosphere ||
    !languages.length
  ) {
    return;
  }

  let currentFocus = 50;
  let targetFocus = 50;

  /*
    Smaller = slower movement.

    The light drifts rather than
    chasing the hovered item.
  */

  const softness = 0.014;


  languages.forEach(
    (language) => {
      language.addEventListener(
        "mouseenter",
        () => {
          const horizonRect =
            horizon.getBoundingClientRect();

          const languageRect =
            language.getBoundingClientRect();

          const languageCenter =
            languageRect.left +
            languageRect.width / 2;

          targetFocus =
            (
              (
                languageCenter -
                horizonRect.left
              ) /
              horizonRect.width
            ) *
            100;
        }
      );
    }
  );


  horizon.addEventListener(
    "mouseleave",
    () => {
      targetFocus = 50;
    }
  );


  function animateHorizonLight() {
    currentFocus +=
      (
        targetFocus -
        currentFocus
      ) *
      softness;

    const position =
      `${currentFocus}%`;

    horizonLine.style.setProperty(
      "--focus-x",
      position
    );

    atmosphere.style.setProperty(
      "--focus-x",
      position
    );

    requestAnimationFrame(
      animateHorizonLight
    );
  }


  animateHorizonLight();

})();


/* ========================================

   DAYLIGHT / DUSK THEME

========================================= */

(() => {

  const root =
    document.documentElement;


  const daylightButton =
    document.querySelector(
      '[data-theme-choice="daylight"]'
    );


  const duskButton =
    document.querySelector(
      '[data-theme-choice="dusk"]'
    );


  if (
    !daylightButton ||
    !duskButton
  ) {
    return;
  }


  const storageKey =
    "portfolio-theme";


  const reduceMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );


  /* ========================================
     READ SAVED THEME
  ========================================= */

  let savedTheme = null;


  try {

    savedTheme =
      localStorage.getItem(
        storageKey
      );

  } catch (error) {

    savedTheme = null;

  }


  const startingTheme =
    savedTheme === "dusk"
      ? "dusk"
      : "daylight";


  /* ========================================
     UPDATE BUTTON STATE
  ========================================= */

  function updateThemeControls(
    theme
  ) {

    const isDusk =
      theme === "dusk";


    daylightButton.setAttribute(
      "aria-pressed",
      String(!isDusk)
    );


    duskButton.setAttribute(
      "aria-pressed",
      String(isDusk)
    );

  }


  /* ========================================
     APPLY THEME
  ========================================= */

  function applyTheme(
    theme,
    animate = true
  ) {

    const isDusk =
      theme === "dusk";


    if (
      animate &&
      !reduceMotion.matches
    ) {

      root.classList.add(
        "theme-transitioning"
      );

    }


    if (isDusk) {

      root.setAttribute(
        "data-theme",
        "dusk"
      );

    } else {

      root.removeAttribute(
        "data-theme"
      );

    }


    updateThemeControls(
      theme
    );


    try {

      localStorage.setItem(
        storageKey,
        theme
      );

    } catch (error) {

      /* Theme still works without storage. */

    }


    window.clearTimeout(
      applyTheme.transitionTimer
    );


    applyTheme.transitionTimer =
      window.setTimeout(
        () => {

          root.classList.remove(
            "theme-transitioning"
          );

        },
        1400
      );

  }


  /* ========================================
     STARTING STATE
  ========================================= */

  applyTheme(
    startingTheme,
    false
  );


  /* ========================================
     CONTROLS
  ========================================= */

  daylightButton.addEventListener(
    "click",
    () => {

      applyTheme(
        "daylight"
      );

    }
  );


  duskButton.addEventListener(
    "click",
    () => {

      applyTheme(
        "dusk"
      );

    }
  );

})();





/* ========================================
   CONTACT MODAL
========================================= */

(() => {
  const modal = document.querySelector("#contact-modal");

  if (!modal) {
    console.warn("Contact modal not found.");
    return;
  }

  const nameField =
    modal.querySelector("#contact-name");


  /* ----------------------------------------
     OPEN
  ----------------------------------------- */

  function openContact() {
    modal.classList.add("is-open");

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "contact-is-open"
    );

    window.setTimeout(() => {
      nameField?.focus();
    }, 400);
  }


  /* ----------------------------------------
     CLOSE
  ----------------------------------------- */

  function closeContact() {
    modal.classList.remove("is-open");

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "contact-is-open"
    );
  }


  /* ----------------------------------------
     CLICK HANDLING
  ----------------------------------------- */

  document.addEventListener("click", (event) => {

    const openButton =
      event.target.closest("[data-contact-open]");

    const closeButton =
      event.target.closest("[data-contact-close]");


    if (openButton) {
      event.preventDefault();

      openContact();

      return;
    }


    if (closeButton) {
      event.preventDefault();

      closeContact();
    }

  });


  /* ----------------------------------------
     ESCAPE KEY
  ----------------------------------------- */

  document.addEventListener("keydown", (event) => {

    if (
      event.key === "Escape" &&
      modal.classList.contains("is-open")
    ) {
      closeContact();
    }

  });


  /* ----------------------------------------
   FORM
----------------------------------------- */

const form =
  modal.querySelector("#contact-form");

const success =
  modal.querySelector("#contact-success");

const status =
  form?.querySelector(
    ".contact-form__status"
  );

const submitButton =
  form?.querySelector(
    ".contact-form__submit"
  );


form?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (status) {
      status.textContent =
        "Sending…";
    }

    if (submitButton) {
      submitButton.disabled = true;
    }


    try {

          const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(
          `Message delivery failed: ${response.status}`
        );
      }

      if (status) {
        status.textContent = "";
      }

      showContactSuccess();

    } catch (error) {

      console.warn(
        "Contact form could not send.",
        error
      );

      if (status) {
        status.textContent =
          "Something went wrong. Please try again.";
      }

      if (submitButton) {
        submitButton.disabled = false;
      }

    }

  }
);


/* ----------------------------------------
   SUCCESS
----------------------------------------- */

function showContactSuccess() {

  if (!form || !success) {
    return;
  }

  form.hidden = true;
  success.hidden = false;

  const successClose =
    success.querySelector(
      ".contact-success__close"
    );

  window.setTimeout(() => {
    successClose?.focus();
  }, 100);

}


/* ----------------------------------------
   RESET
----------------------------------------- */

function resetContactForm() {

  if (!form) {
    return;
  }

  form.reset();
  form.hidden = false;

  if (success) {
    success.hidden = true;
  }

  if (status) {
    status.textContent = "";
  }

  if (submitButton) {
    submitButton.disabled = false;
  }

}

})();

