class SearchPage extends HTMLElement {
  constructor() {
    super();
    this.limit = this.getAttribute("limit") || 25;
    this.aspectsContainer = this.querySelector(`#aspects-container`);
    this.activeAspectsContainer = this.querySelector(
      `#active-aspects-container`,
    );
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
   this.activeAspectsContainer.addEventListener("keypress", (e) => {
     if (e.key === "Enter") {
      this.buildSearch();
     }
   });
   this.querySelector(".search-button").addEventListener("click", () =>
     this.buildSearch(),
   );
   const params = new URLSearchParams(window.location.search);
   const query = params.get('q');
   if (query) {
    this.querySelector(".search-input").value = query;
    await this.buildSearch();
   }
  }

  async buildSearch() {
    const query = this.querySelector(".search-input").value;
    if (!query) return;

    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.replaceState({}, '', url);

    const resultsContainer = this.querySelector(".results-container");
    resultsContainer.innerHTML = "Searching...";

    try {
      const requestOptions = {
        method: "GET",
        redirect: "follow",
      };

      fetch(
        `https://84cf-187-161-119-1.ngrok-free.app/get_aspects?query=${query}&aspects=${this.activeAspects.join(",")}`,
        requestOptions,
      )
        .then((response) => response.json())
        .then(async (result) => {
          await this.buildAspects(result);
          await this.search();
        })
        .catch((error) => console.error(error));
    } catch (error) {
      console.error(error);
      resultsContainer.innerHTML = "Error fetching results.";
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
    const query = this.querySelector(".search-input").value;
    if (!query) return;

    const resultsContainer = this.querySelector(".results-container");
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      text: this.activeAspects.join(" ") + " " + query,
      limit: 25,
      custom_prompt:
        "Given the following short query, please expand it into a more detailed and specific form. Consider adding relevant details such as product features, intended use, or any specific attributes that might be important for a comprehensive search. Your response should maintain the intent of the original query but provide additional keywords that could help in refining search results. Assume the query is meant for an e-commerce search engine that caters to a wide variety of products.",
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("https://84cf-187-161-119-1.ngrok-free.app/search", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        resultsContainer.innerHTML = "";

        for (const item of data.results.vector_results) {
          const searchResultCard = document.createElement("div");
          searchResultCard.classList.add("search-result-card");

          const searchLink = document.createElement("a");
          searchLink.href = `/products/${item.product_url}`;
          searchLink.classList.add("search-link");

          const imgFrame = document.createElement("div");
          imgFrame.classList.add("search-item-img-frame");

          const img = document.createElement("img");
          img.src = item.image_url;
          img.alt = item.name;
          img.classList.add("search-item-img");
          img.loading = "lazy";

          imgFrame.appendChild(img);

          const title = document.createElement("h3");
          title.textContent = item.name;

          const priceContainer = document.createElement("div");
          priceContainer.classList.add("search-item-price-container");

          // Create price span
          const priceSpan = document.createElement("span");
          priceSpan.classList.add("search-item-price");
          priceSpan.textContent = this.itemMoneyFormat(item.price);

          // Append priceSpan to priceContainer
          priceContainer.appendChild(priceSpan);

          // Append all elements to searchLink
          searchLink.appendChild(imgFrame);
          searchLink.appendChild(title);
          searchLink.appendChild(priceContainer);

          // Append searchLink to searchResultCard
          searchResultCard.appendChild(searchLink);

          resultsContainer.appendChild(searchResultCard);
        }
      })
      .catch((error) => console.error(error));
  }

  async readAspects() {
    const activeAspects = this.activeAspects;

    this.activeAspectsContainer.innerHTML = "";
    for (const aspect of activeAspects) {
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

    console.log(`this.activeAspects`);
    console.log(this.activeAspects);

    this.activeAspects = this.activeAspects.filter((item) => item !== aspect);

    console.log(`this.activeAspects`);
    console.log(this.activeAspects);

    await this.readAspects();
    await this.buildSearch();
  }

  async addAspect(event) {
    const label = event.target;
    const aspect = label.getAttribute("aspect");
    this.activeAspects.push(aspect);
    this.readAspects();
  }
}

customElements.define("search-page", SearchPage);
