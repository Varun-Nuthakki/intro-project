require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true }
);

const server = express();
const PORT = process.env.PORT || 3000;
server.set("view engine", "ejs");
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.static("public"));

let alertMessage = "";
let addSearch, minusSearch, deleteSearch, renameSearch;
let success;

const itemSchema = {
  id: Number,
  name: String,
  size: Number,
};

const Item = mongoose.model("Item", itemSchema);

server.post("/", function (req, res) {
  const search = _.lowerCase(req.body.searchbox);
  console.log(search);
  let items = [];
  const title = "Intro-Project";

  if ("clear-btn" in req.body) {
    res.redirect("/");
  } else if ("new-btn" in req.body) {
    success = true;
    res.redirect("/new");
  } else if ("closebtn" in req.body || "closebtn1" in req.body) {
    res.redirect("/");
  } else if ("cancelbtn" in req.body || "cancelbtn1" in req.body) {
    res.redirect("/");
  } else if ("addclose" in req.body || "addclose1" in req.body) {
    res.redirect("/");
  } else if ("minusclose" in req.body || "minusclose1" in req.body) {
    res.redirect("/");
  } else if ("renameclose" in req.body || "renameclose1" in req.body) {
    res.redirect("/");
  } else if ("add" in req.body) {
    const a = req.body.add;
    res.redirect("/add?addSearch=" + a);
  } else if ("minus" in req.body) {
    const m = req.body.minus;
    res.redirect("/minus?minusSearch=" + m);
  } else if ("delete" in req.body) {
    const d = req.body.delete;
    success = true;
    res.redirect("/delete?deleteSearch=" + d);
  } else if ("rename" in req.body) {
    const r = req.body.rename;
    res.redirect("/rename?renameSearch=" + r);
  } else if ("showDelete" in req.body) {
    const deleteBox = req.body.showDelete;
    const message = deleteBox + " has been successfully deleted.";
    Item.find({ name: deleteBox }, function (err, items) {
      if (err) {
        console.log(err);
      } else {
        success = true;
        res.redirect("/delete?deleteSearch=" + deleteBox);
      }
    });
  } else if ("deletebtn" in req.body) {
    const deleteBox = req.body.deletebtn;
    const message = deleteBox + " has been successfully deleted.";
    Item.find({ name: deleteBox }, function (err, items) {
      if (err) {
        console.log(err);
      } else {
        if (items) {
          Item.deleteMany({ name: deleteBox }, function (err, deleteItems) {
            if (err) {
              console.log(err);
            } else {
              success = true;
              console.log("Successfully deleted", deleteItems);
            }
          });
        } else {
          success = false;
          res.redirect("/delete?deleteSearch=" + deleteBox);
        }
      }
    });
    if (success) {
      res.render("index", { title: title, alertMessage: message, search: "" });
    }
  } else if ("newbtn" in req.body) {
    const newBox = _.lowerCase(req.body.newbox);
    const sizeBox = Number(req.body.sizebox);
    const message =
      "SUCCESS!! " +  "New item " + newBox + " has been successfully added and saved";
    Item.find({ name: newBox }, function (err, items) {
      if (err) {
        console.log(err);
      } else {
        if (items.length === 0) {
          const item = new Item({
            name: newBox,
            size: sizeBox,
          });
          item.save(function (err, saved) {
            if (err) {
              console.log(err);
            } else {
              console.log("Item saved successfully: ", saved);
              res.render("index", {
                title: title,
                search: "",
                alertMessage: message,
              });
            }
          });
        } else {
          success = false;
          res.redirect("/new?name=" + newBox);
        }
      }
    });
  } else if ("show-btn" in req.body) {
    Item.find({}, function (err, items) {
      if (err) {
        console.log(err);
      } else {
        res.render("show_all", { items: items });
      }
    });
  } else if ("addbtn" in req.body) {
    const addBox = Number(req.body.addbox);
    const addSearch = req.body.addbtn;
    Item.findOne({ name: addSearch }, function (err, item) {
      if (err) {
        console.log("Error: " + err);
      } else {
        item.size = item.size + addBox;
        item.save(function (err, updatedItem) {
          if (err) {
            console.error("Error updating Item: ", err);
          } else {
            console.log("Item updated successfully: ", updatedItem);
            res.render("index", {
              title: title,
              items: [updatedItem],
              alertMessage: "",
              search: addSearch,
            });
          }
        });
      }
    });
  } else if ("minusbtn" in req.body) {
    const minusBox = Number(req.body.minusbox);
    const minusSearch = req.body.minusbtn;
    Item.findOne({ name: minusSearch }, function (err, item) {
      if (err) {
        console.log("Error: " + err);
      } else {
        item.size = item.size - minusBox;
        item.save(function (err, updatedItem) {
          if (err) {
            console.log("Error updating Item: ", err);
          } else {
            console.log("Item updated successfully: ", updatedItem);
            res.render("index", {
              title: title,
              items: [updatedItem],
              alertMessage: "",
              search: minusSearch,
            });
          }
        });
      }
    });
  } else if ("renamebtn" in req.body) {
    const renameBox = _.lowerCase(req.body.renamebox);
    const renameSearch = req.body.renamebtn;
    Item.findOne({ name: renameSearch }, function (err, item) {
      if (err) {
        console.log(err);
      } else {
        item.name = renameBox;
        console.log("jio");
        item.save(function (err, updatedItem) {
          if (err) {
            console.log(err);
          } else {
            console.log("Item updated successfully: ", updatedItem);
            res.render("index", {
              title: title,
              items: [updatedItem],
              alertMessage: "",
              search: renameBox,
            });
          }
        });
      }
    });
  } else {
    Item.find({ name: search }, function (err, itemsFound) {
      if (err) {
        console.log(err);
      } else {
        if (itemsFound.length === 0) {
          const alertMessage =
            "Error! There is no item with the name " + search;
          res.render("index", {
            title: title,
            search: search,
            items: items,
            alertMessage: alertMessage,
          });
        } else {
          items = itemsFound; 
          res.render("index", {
            title: title,
            search: search,
            items: items,
            alertMessage: "",
          });
        }
      }
    });
  }
});

server.get("/", function (req, res) {
  const title = "Intro-Project";
  const search = "";
  const items = [];
  res.render("index", {
    title: title,
    search: search,
    items: items,
    alertMessage: alertMessage,
  });
});

server.get("/new", function (req, res) {
  const name = req.query.name;
  res.render("new", { success: success, name: name });
});

server.get("/add", function (req, res) {
  addSearch = req.query.addSearch;
  res.render("add", { addSearch: addSearch });
});

server.get("/minus", function (req, res) {
  minusSearch = req.query.minusSearch;
  res.render("minus", { minusSearch: minusSearch });
});

server.get("/rename", function (req, res) {
  renameSearch = req.query.renameSearch;
  res.render("rename", { renameSearch: renameSearch });
});

server.get("/delete", function (req, res) {
  deleteSearch = req.query.deleteSearch;
  res.render("delete", { deleteSearch: deleteSearch, success: success });
});

server.listen(PORT, function () {
  console.log(`Server is running on ${PORT}`);
});
