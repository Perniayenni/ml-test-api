const { response } = require("express");
const axios = require("axios");

const searchItems = async (req, res = response) => {
  let apiResult = { suggested_queries: [] };
  try {
    queries = await axios.get(`https://api.mercadolibre.com/sites/MLA/search`, {
      params: { q: req.query.q  || req.query.search },
    });

    apiResponse = queries.data;

    if (apiResponse.results.length > 0) {
      apiResult = {
        author: {
          name: "Yennifer",
          lastname: "Pernía",
        },
        categories: getCategories(apiResponse),
        items: getItems(apiResponse),
      };
    }
  } catch (error) {
    console.error(error);
    apiResult = error.data;
  }

  res.json(apiResult);
};

const getItemDetail = async (req, res = response) => {
  let item = {};
  let description = "";
  let categories = [];
  let apiResult = {};
  try {
    const resultItem = await axios.get(
      `https://api.mercadolibre.com/items/${req.params.id}`
    );

    const resultDescription = await axios.get(
      `https://api.mercadolibre.com/items/${req.params.id}/description`
    );

    item = resultItem.data;
    description = resultDescription.data;

    const resultCategories = await axios.get(
      `https://api.mercadolibre.com/categories/${item.category_id}`
    );
    categories = resultCategories.data.path_from_root.map((resp) => resp.name);
    apiResult = {
      author: {
        name: "Yennifer",
        lastname: "Pernía",
      },
      item: {
        id: item.id,
        title: item.title,
        price: {
          currency: item.currency_id,
          amount: item.price,
          decimals: 0,
        },
        picture: item.pictures[0].url,
        condition: item.condition,
        free_shipping: item.shipping.free_shipping,
        sold_quantity: item.sold_quantity,
        description: description.plain_text,
        categories: categories,
      },
    };
  } catch (error) {
    console.error(error);
    apiResult = error.data;
  }

  res.json(apiResult);
};

function getItemPrice(result) {
  if (result.prices && result.prices.prices != null) {
    price = result.prices.prices[0];
    return {
      currency: price.currency_id,
      amount: price.amount,
      decimals: price.decimals ? price.decimals : 0,
    };
  } else {
    return {
      currency: result.currency_id,
      amount: result.price,
      decimals: 0,
    };
  }
}

function getItems(apiResponse) {
  let items = [];
  for (let i = 0; i <= 3; i++) {
    let result = apiResponse.results[i];
    items.push({
      id: result.id,
      title: result.title,
      price: getItemPrice(result),
      picture: result.thumbnail,
      condition: result.condition,
      free_shipping: result.shipping.free_shipping,
      state_name: result.address.state_name,
    });
  }
  return items;
}

function getCategories(apiResponse) {
  let categories = [];
  if (apiResponse.filters.length > 0) {
    categories = apiResponse.filters
      .find((filter) => filter.id == "category")
      .values.sort((value) => value.results)
      .map((value) => value.name);
  } else {
    categories = apiResponse.available_filters
      .find((filter) => filter.id == "category")
      .values.sort((value) => value.results)
      .map((value) => value.name);
  }
  return categories;
}

module.exports = {
  searchItems,
  getItemDetail,
};
