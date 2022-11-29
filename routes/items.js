const { Router } = require("express");
const { searchItems, getItemDetail } = require("../controllers/items");
const router = Router();

router.get("/", searchItems);

router.get("/:id", getItemDetail);

module.exports = router;
