class SearchPage extends HTMLElement {
  constructor() {
    super();
    this.limit = this.getAttribute('limit') || 25;
  }

  connectedCallback() {
    this.querySelector(".search-button").addEventListener("click", () =>
      this.search(),
    );
  }

  async search() {
    const query = this.querySelector(".search-input").value;
    if (!query) return;

    const resultsContainer = this.querySelector(".results-container");
    resultsContainer.innerHTML = "Searching...";

    try {

     const myHeaders = new Headers();
     myHeaders.append("Content-Type", "application/json");

     const raw = JSON.stringify({
       "text": query,
       "limit": 25,
       "custom_prompt": "Given the following short query, please expand it into a more detailed and specific form. Consider adding relevant details such as product features, intended use, or any specific attributes that might be important for a comprehensive search. Your response should maintain the intent of the original query but provide additional keywords that could help in refining search results. Assume the query is meant for an e-commerce search engine that caters to a wide variety of products."
     });

     const requestOptions = {
       method: "POST",
       headers: myHeaders,
       body: raw,
       redirect: "follow"
     };

     fetch("https://41de-187-161-119-1.ngrok-free.app/search", requestOptions)
     .then((response) => response.json())
     .then((data) => {

      console.log(`results.vector_results`,data.results.vector_results)

      resultsContainer.innerHTML = data.results.vector_results
        .map(
          (
            item,
          ) => `<div class="search-result-card">
                  <a href="/products/${item.product_url}" class="search-link">
                   <div class="search-item-img-frame" >
                    <img src="${item.image_url}" alt="${item.name}" class="search-item-img" loading="lazy" />
                   </div>
                   <h3>${item.name}</h3>
                   <div class="search-item-price-container">
                    <span class="search-item-price"> $ ${item.price} </span>
                   </div>
                  </a>
                </div>`,
        )
        .join("");
     })
     .catch((error) => console.error(error));
    } catch (error) {
      console.error(error);
      resultsContainer.innerHTML = "Error fetching results.";
    }
  }
}

customElements.define("search-page", SearchPage);
