class SearchPage extends HTMLElement {
  constructor() {
    super();
    this.limit = this.getAttribute("limit") || 25;
    this.aspectsContainer = this.querySelector(`#aspects-container`);
    this.activeAspectsContainer = this.querySelector(`#active-aspects-container`);
    this.resultsHeading = this.querySelector(".results-heading");
    this.searchInput = this.querySelector(".search-input");
    this.resultsContainer = this.querySelector(".results-container");
    this.activeAspects = [];
    this.toSelectAspects = [];
  }

  itemMoneyFormat(float) {
    return float.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  async connectedCallback() {
    // Escuchar Enter o botón "Search"
    this.activeAspectsContainer.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.buildSearch();
    });
    this.querySelector(".search-button").addEventListener("click", () => this.buildSearch());

    // Botones de sugerencias como "I'm going on a trip"
    const buttons = this.querySelectorAll(".get-started-buttons button");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const query = btn.textContent.trim();
        this.searchInput.value = query;
        this.buildSearch();
      });
    });

    // Si hay ?q= en la URL, buscarlo; si no, mostrar populares
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query) {
      this.searchInput.value = query;
      await this.buildSearch();
    } else {
      this.showPopularItems(); // Estado inicial
    }
  }

  async buildSearch() {
    const query = this.searchInput.value;
    if (!query) return;

    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.replaceState({}, '', url);

    this.resultsContainer.innerHTML = "Searching...";
    this.resultsHeading.textContent = "Searching...";

    try {
      const requestOptions = {
        method: "POST",
        redirect: "follow",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          aspects: this.activeAspects.join(","),
        }),
      };

      const response = await fetch(`https://d37ia7ubfgdimd.cloudfront.net/api/aspects`, requestOptions);
      const result = await response.json();

      await this.buildAspects(result);
      await this.search();
    } catch (error) {
      console.error(error);
      this.resultsContainer.innerHTML = "Error fetching results.";
    }
  }

  async buildAspects(aspectsResult) {
    const aspects = aspectsResult.aspects;
    this.toSelectAspects = aspects;
    this.aspectsContainer.innerHTML = "";
    for (const aspect of aspects) {
      const label = document.createElement(`label`);
      label.setAttribute("aspect", aspect);
      label.innerHTML = aspect;
      label.addEventListener("click", (event) => this.addAspect(event));
      this.aspectsContainer.appendChild(label);
    }
  }

  async search() {
    const query = this.searchInput.value;
    if (!query) return;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      query: query,
      limit: 25,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch("https://d37ia7ubfgdimd.cloudfront.net/api/search", requestOptions);
      const data = await response.json();

      this.resultsContainer.innerHTML = "";

      if (!data.results?.length) {
        this.resultsHeading.textContent = `No results for "${query}"`;
        this.resultsContainer.innerHTML = `<p>No items found. Try something else.</p>`;
        return;
      }

      this.resultsHeading.textContent = `Here’s what we found for you (${data.results.length} items):`;

      for (const item of data.results) {
        const searchResultCard = document.createElement("div");
        searchResultCard.classList.add("search-result-card");

        const searchLink = document.createElement("a");
        searchLink.href = item.product_url;
        searchLink.classList.add("search-link");

        const imgFrame = document.createElement("div");
        imgFrame.classList.add("search-item-img-frame");

        const img = document.createElement("img");
        img.src = item.image_url;
        img.alt = item.name;
        img.classList.add("search-item-img");
        img.loading = "lazy";

        imgFrame.appendChild(img);

        const title = document.createElement("h5");
        title.textContent = item.name;

        const priceContainer = document.createElement("div");
        priceContainer.classList.add("search-item-price-container");

        const priceSpan = document.createElement("span");
        priceSpan.classList.add("search-item-price");
        priceSpan.textContent = this.itemMoneyFormat(item.price);

        priceContainer.appendChild(priceSpan);
        searchLink.appendChild(imgFrame);
        searchLink.appendChild(title);
        searchLink.appendChild(priceContainer);
        searchResultCard.appendChild(searchLink);
        this.resultsContainer.appendChild(searchResultCard);
      }
    } catch (error) {
      console.error(error);
      this.resultsContainer.innerHTML = "Error loading results.";
    }
  }

  async readAspects() {
    this.activeAspectsContainer.innerHTML = "";
    for (const aspect of this.activeAspects) {
      const label = document.createElement(`label`);
      label.classList.add("active");
      label.setAttribute("aspect", aspect);
      label.innerHTML = aspect;
      label.addEventListener("click", (event) => this.removeAspect(event));
      this.activeAspectsContainer.appendChild(label);
    }
    await this.buildSearch();
  }

  async removeAspect(event) {
    const label = event.target;
    const aspect = label.getAttribute("aspect");
    this.activeAspects = this.activeAspects.filter((item) => item !== aspect);
    await this.readAspects();
  }

  async addAspect(event) {
    const label = event.target;
    const aspect = label.getAttribute("aspect");
    this.activeAspects.push(aspect);
    this.readAspects();
  }

  async showPopularItems() {
    this.resultsHeading.textContent = "Popular Items";
    this.resultsContainer.innerHTML = `<p>Use the search bar or try one of the suggestions above.</p>`;
  }
}

customElements.define("search-page", SearchPage);
