import React, { Component } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ReactiveBase, ReactiveList } from "@appbaseio/reactivesearch";
import WillDisplay from "./WillDisplay";
import {
  Paper,
  Select,
  MenuItem,
  Breadcrumbs,
  Link,
  Typography
} from "@material-ui/core";
import TrendingUpIcon from "@material-ui/icons/TrendingUpOutlined";
import TrendingDownIcon from "@material-ui/icons/TrendingDownOutlined";
import "../styles/Wills.css";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import {
  getParamConfig,
  createStyled,
  getHitsFromQuery
} from "../utils/functions";
import classNames from "classnames";

const { ResultListWrapper } = ReactiveList;

const Styled = createStyled(theme => ({
  link: {
    textTransform: "none",
    paddingLeft: 15,
    color: "#212121",
    fontSize: 18,
    fontWeight: 500,
    fontFamily: "-apple-system",
    "&:hover, &:focus": {
      color: "#0091EA",
      fontWeight: 600,
      backgroundColor: "#eceff1"
    },
    "&:active": {
      color: "#0091EA",
      fontWeight: 600
    }
  },
  activedLink: {
    color: "#0091EA",
    fontWeight: 600
  },

  linkPage: {
    color: "#212121",
    fontSize: 18,
    fontWeight: 400,
    "&:hover": {
      color: "#0091EA"
    }
  },
  selectedLink: {
    fontWeight: 600,
    color: "#0091EA",
    fontSize: 18
  }
}));

function createPageMenu(will_id, pages, idx, handleClick) {
  let menu = [];
  let listMenu = { page: "Page", envelope: "Enveloppe", codicil: "Codicille" };
  for (let i = 0; i < pages.length; i++) {
    menu.push(
      <Styled key={i}>
        {({ classes }) => (
          <Link
            id={i}
            value={i}
            component="button"
            color="inherit"
            component={RouterLink}
            to={
              "/will/" +
              will_id +
              "/" +
              pages[i]["page_type"].type +
              "_" +
              pages[i]["page_type"].id
            }
            onClick={handleClick}
            className={
              parseInt(idx) === i
                ? classNames(classes.typography, classes.selectedLink)
                : classNames(classes.linkPage, classes.typography)
            }
          >
            {listMenu[pages[i]["page_type"].type]} {pages[i]["page_type"].id}
          </Link>
        )}
      </Styled>
    );
  }
  return (
    <Breadcrumbs
      style={{ marginTop: 20, marginBottom: 20 }}
      aria-label="Breadcrumb"
    >
      {" "}
      {menu}{" "}
    </Breadcrumbs>
  );
}

class Will extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      page: 0
    };

    this.renderFunc = this.renderFunc.bind(this);
  }

  renderFunc() {
    if (this.state.data.length > 0) {
      return (
        <div className="root">
          <Paper>
            <WillDisplay
              id={this.state.data[0]["_id"]}
              data={this.state.data[0]._source}
              cur_page={this.state.page}
              createPageMenu={createPageMenu}
            />
          </Paper>
        </div>
      );
    } else {
      return (
        <div>
          <h3>Pas de résultat</h3>
        </div>
      );
    }
  }

  componentDidMount() {
    const url = document.location.href;
    const idx = url.lastIndexOf("will/");
    if (idx !== -1) {
      const url_query = url.substring(idx + 5).split("/");
      const query_id = url_query.length > 0 ? url_query[0] : "";
      const newData = getHitsFromQuery(
        getParamConfig("es_host") + "/" + getParamConfig("es_index_wills"),
        JSON.stringify({
          query: {
            term: {
              _id: query_id
            }
          }
        })
      );
      this.setState({
        data: newData,
        page:
          url_query.length > 1
            ? {
                type: url_query[1].split("_")[0],
                id: parseInt(url_query[1].split("_")[1])
              }
            : {}
      });
    }
  }

  render() {
    const prevLink = sessionStorage.uriSearch
      ? "/search?" + sessionStorage.uriSearch.split("?")[1]
      : "/search";

    const will_link =
      this.state.data.length > 0 ? (
        <Typography color="textPrimary" key={2}>
          {this.state.data[0]._source["will_identifier.name"]}
        </Typography>
      ) : null;

    return (
      <div>
        <div className="wills_menu">
          <Paper elevation={0}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="Breadcrumb"
            >
              <Link
                id="search"
                color="inherit"
                key={0}
                component={RouterLink}
                to={prevLink}
              >
                {sessionStorage.uriSearch
                  ? "Modifier ma recherche"
                  : "Recheche"}
              </Link>
              {will_link}
            </Breadcrumbs>
          </Paper>
        </div>

        <div>{this.renderFunc()}</div>
      </div>
    );
  }
}

export default Will;
