# U.S. Election Map

An independent, interactive choropleth map of U.S. presidential election results from 2000 through 2024.

**Live site:** https://iamdatagabs.github.io/us-election-map/

## Features
- Presidential election cycles: 2000, 2004, 2008, 2012, 2016, 2020 and 2024.
- Toggle between Democratic–Republican margin and winning party.
- Hover, keyboard-focus and select individual states.
- State profile with party vote shares, margin and total reported votes.
- Responsive layout; static hosting with no backend dependency.

## Data and methodology
Election results are derived from the project's versioned extract of the MIT Election Data and Science Lab, *County Presidential Election Returns 2000–2024* (Harvard Dataverse, [DOI 10.7910/DVN/VOQCHQ](https://doi.org/10.7910/DVN/VOQCHQ), CC0 1.0). State values are aggregated from county-level returns.

Margin is calculated as:

`(Democratic votes - Republican votes) / total reported votes * 100`

The denominator includes third-party votes. This is not a measure of eligible-voter turnout. Missing observations are not imputed as zero. The map is descriptive and does not represent certified election administration records.

Map geometry: [US Atlas](https://github.com/topojson/us-atlas). Rendering: [D3.js](https://d3js.org/) and [TopoJSON Client](https://github.com/topojson/topojson-client).

## Run locally
Serve the repository root over HTTP (for example, `python -m http.server 8000`) and open `http://localhost:8000`. The data file is loaded from `data/presidential-timeseries.json`.

## Deployment
GitHub Actions publishes the repository root to GitHub Pages on pushes to `main). In the repository, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source if Pages is not already enabled.

## License
The MIT Election Lab source dataset is CC0 1.0. The application code in this repository is MIT licensed.