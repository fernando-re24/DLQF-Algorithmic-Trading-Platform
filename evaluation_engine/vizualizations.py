"""
Generate visualizations of a trading simulation.
Author: Fernando Espinoza
"""

from __future__ import annotations

import base64
import html
import io
import json
from pathlib import Path
from typing import Any, Iterable, Mapping, Tuple

import matplotlib.pyplot as plt
import pandas as pd

__all__ = [
    "Vizualizations",
    "capital_hist",
    "capital_hist_comparison",
    "capital_hist_comparison_suite",
    "signals",
    "signals_comparison",
    "signals_comparison_suite",
    "save_figure",
    "figure_to_html",
    "figure_to_html_report",
]

"""
 Normalize incoming data to a pandas Series while preserving existing indexes.
"""


def _as_series(
    data: pd.DataFrame | pd.Series | Iterable[float], name: str
) -> pd.Series:
    if isinstance(data, pd.Series):
        series = data.copy()
    elif isinstance(data, pd.DataFrame):
        if data.shape[1] != 1:
            raise ValueError(f"{name} must have exactly one column")
        series = data.iloc[:, 0].copy()
    else:
        series = pd.Series(list(data))
    series = pd.Series(series).copy()
    if not series.name:
        series.name = name
    return series


"""
Utility Method
"""


def _figure_to_base64_png(fig: plt.Figure, dpi: int = 160) -> str:
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=dpi, bbox_inches="tight")
    buf.seek(0)
    encoded = base64.b64encode(buf.getvalue()).decode("ascii")
    return encoded


"""
Utility Method
"""


def _metrics_to_html_pre(metrics: Mapping[str, Any]) -> str:
    serializable = json.loads(json.dumps(metrics, default=str))
    return f"<pre>{html.escape(json.dumps(serializable, indent=2, default=str))}</pre>"


"""Utility Method"""


def _new_figure(title: str) -> Tuple[plt.Figure, plt.Axes]:
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.set_title(title)
    ax.grid(True, alpha=0.25, linestyle="--")
    return fig, ax


class Vizualizations:
    """Plot helpers for simulator outputs."""

    """Plot the capital history of a single model run.
    Returns
    -------
    fig, ax : matplotlib Figure and Axes with the line plot.
    """

    @staticmethod
    def capital_hist(
        hist: pd.DataFrame | pd.Series | Iterable[float],
    ) -> Tuple[plt.Figure, plt.Axes]:

        series = _as_series(hist, "Capital")
        fig, ax = _new_figure("Capital History")
        ax.plot(series.index, series.values, label=series.name, color="#1f77b4")
        ax.set_xlabel("Time")
        ax.set_ylabel("Portfolio Value")
        ax.legend(loc="best")
        fig.tight_layout()
        return fig, ax

    @staticmethod
    def capital_hist_comparison(
        hist1: pd.DataFrame | pd.Series | Iterable[float],
        hist2: pd.DataFrame | pd.Series | Iterable[float],
        labels: Tuple[str, str] = ("Model", "Benchmark"),
    ) -> Tuple[plt.Figure, plt.Axes]:
        """Plot and compare capital histories of two runs (e.g., model vs. buy-and-hold)."""
        series1 = _as_series(hist1, labels[0])
        series2 = _as_series(hist2, labels[1])
        fig, ax = _new_figure("Capital History Comparison")
        ax.plot(series1.index, series1.values, label=series1.name, color="#1f77b4")
        ax.plot(series2.index, series2.values, label=series2.name, color="#ff7f0e")
        ax.set_xlabel("Time")
        ax.set_ylabel("Portfolio Value")
        ax.legend(loc="best")
        fig.tight_layout()
        return fig, ax

    @staticmethod
    def capital_hist_comparison_suite(
        histories: Mapping[str, pd.DataFrame | pd.Series | Iterable[float]],
        title: str = "Capital History Comparison",
    ) -> Tuple[plt.Figure, plt.Axes]:
        if not histories:
            raise ValueError("No histories provided for comparison.")
        fig, ax = _new_figure(title)
        color_cycle = plt.rcParams["axes.prop_cycle"].by_key()["color"]

        for i, (label, history) in enumerate(histories.items()):
            series = _as_series(history, label)
            ax.plot(
                series.index,
                series.values,
                label=series.name,
                color=color_cycle[i % len(color_cycle)],
            )

        ax.set_xlabel("Time")
        ax.set_ylabel("Portfolio Value")
        ax.legend(loc="best")
        fig.tight_layout()
        return fig, ax

    """Plot the signals (swing/position predictions) for one model."""

    @staticmethod
    def signals(
        swings: pd.DataFrame | pd.Series | Iterable[float],
    ) -> Tuple[plt.Figure, plt.Axes]:
        """Plot swing/position predictions (-1 sell, 0 hold, 1 buy) for one model."""
        series = _as_series(swings, "Signal")
        fig, ax = _new_figure("Model Signals")
        ax.step(
            series.index, series.values, where="mid", label=series.name, color="#2ca02c"
        )
        ax.set_yticks([-1, 0, 1])
        ax.set_ylabel("Signal")
        ax.set_xlabel("Time")
        ax.legend(loc="best")
        fig.tight_layout()
        return fig, ax

    """Plot and compare swing predictions for two runs."""

    @staticmethod
    def signals_comparison(
        swings1: pd.DataFrame | pd.Series | Iterable[float],
        swings2: pd.DataFrame | pd.Series | Iterable[float],
        labels: Tuple[str, str] = ("Model", "Benchmark"),
    ) -> Tuple[plt.Figure, plt.Axes]:
        """Plot and compare swing predictions for two runs."""
        series1 = _as_series(swings1, labels[0])
        series2 = _as_series(swings2, labels[1])
        fig, ax = _new_figure("Signal Comparison")
        ax.step(
            series1.index,
            series1.values,
            where="mid",
            label=series1.name,
            color="#2ca02c",
        )
        ax.step(
            series2.index,
            series2.values,
            where="mid",
            label=series2.name,
            color="#d62728",
        )
        ax.set_yticks([-1, 0, 1])
        ax.set_ylabel("Signal")
        ax.set_xlabel("Time")
        ax.legend(loc="best")
        fig.tight_layout()
        return fig, ax

    """Plot and compare swing predictions for multiple runs."""

    @staticmethod
    def signals_comparison_suite(
        swings_map: Mapping[str, pd.DataFrame | pd.Series | Iterable[float]],
        title: str = "Signal Comparison",
    ) -> Tuple[plt.Figure, plt.Axes]:
        if not swings_map:
            raise ValueError("No signals provided for comparison.")
        fig, ax = _new_figure(title)
        color_cycle = plt.rcParams["axes.prop_cycle"].by_key()["color"]

        for i, (label, swings) in enumerate(swings_map.items()):
            series = _as_series(swings, label)
            ax.step(
                series.index,
                series.values,
                where="mid",
                label=series.name,
                color=color_cycle[i % len(color_cycle)],
            )

        ax.set_yticks([-1, 0, 1])
        ax.set_ylabel("Signal")
        ax.set_xlabel("Time")
        ax.legend(loc="best")
        fig.tight_layout()
        return fig, ax

    """Save a figure to a file and return the file path."""

    @staticmethod
    def save_figure(fig: plt.Figure, file_path: str | Path, dpi: int = 160) -> str:
        fig.savefig(str(file_path), dpi=dpi, bbox_inches="tight")
        return str(file_path)


"""Convert a figure to an HTML string for embedding in a web page."""


def figure_to_html(fig: plt.Figure, title: str | None = None) -> str:
    encoded = _figure_to_base64_png(fig)
    caption = f"<figcaption>{title}</figcaption>" if title else ""
    return f"""
    <figure>
      {caption}
      <img src="data:image/png;base64,{encoded}" alt="{title or "Figure"}" />
    </figure>
    """


"""Convert a figure to an HTML string for embedding in a web page."""


def figure_to_html_report(
    output_path: str | Path,
    model_metrics: Mapping[str, Any],
    benchmark_metrics: Mapping[str, Mapping[str, Any]] | None = None,
    capital_figure: plt.Figure | None = None,
    signals_figure: plt.Figure | None = None,
    title: str = "Evaluation Report",
) -> str:
    tabs_id = "eval-tabs"
    output_path = Path(output_path)

    charts: list[str] = []
    if capital_figure is not None:
        charts.append(figure_to_html(capital_figure, "Capital Comparison"))
    if signals_figure is not None:
        charts.append(figure_to_html(signals_figure, "Signal Comparison"))
    charts_html = "\n".join(charts) if charts else "<p>No charts provided.</p>"

    metrics_json = _metrics_to_html_pre(dict(model_metrics))

    bench_json = ""
    if benchmark_metrics:
        bench_parts = []
        for name, values in benchmark_metrics.items():
            bench_parts.append(f"<h4>{name}</h4>\n{_metrics_to_html_pre(values)}")
        bench_json = "<div>" + "\n".join(bench_parts) + "</div>"

    html = f"""
<!doctype html>
<html>
<head>
  <meta charset=\"utf-8\" />
  <title>{title}</title>
  <style>
    body {{ font-family: Arial, sans-serif; margin: 24px; background: #f7f7fb; color: #111; }}
    .tabs {{ display: flex; gap: 12px; margin-bottom: 16px; }}
    .tab-btn {{ border: 1px solid #ccc; border-bottom: none; padding: 8px 12px; cursor: pointer; }}
    .tab-btn.active {{ background: #fff; font-weight: 600; }}
    .tab-content {{ border: 1px solid #ccc; padding: 12px; background: #fff; }}
    .hidden {{ display: none; }}
    pre {{ white-space: pre-wrap; background: #111827; color: #e5e7eb; padding: 16px; overflow: auto; }}
    figure {{ margin: 16px 0; }}
    img {{ max-width: 100%; height: auto; }}
  </style>
  <script>
    function showTab(id) {{
      const metrics = document.getElementById("tab-metrics");
      const charts = document.getElementById("tab-charts");
      const btnMetrics = document.getElementById("btn-metrics");
      const btnCharts = document.getElementById("btn-charts");

      if (id === "charts") {{
        charts.classList.remove("hidden");
        metrics.classList.add("hidden");
        btnCharts.classList.add("active");
        btnMetrics.classList.remove("active");
      }} else {{
        metrics.classList.remove("hidden");
        charts.classList.add("hidden");
        btnMetrics.classList.add("active");
        btnCharts.classList.remove("active");
      }}
    }}
  </script>
</head>
<body>
  <h1>{title}</h1>
  <div class=\"tabs\">
    <button id=\"btn-metrics\" class=\"tab-btn active\" onclick=\"showTab('metrics')\">Metrics</button>
    <button id=\"btn-charts\" class=\"tab-btn\" onclick=\"showTab('charts')\">Charts</button>
  </div>

  <div id=\"tab-metrics\" class=\"tab-content\">
    <h2>Model Metrics</h2>
    {metrics_json}

    <h2>Benchmark Metrics</h2>
    {bench_json or "<p>No benchmark metrics provided.</p>"}
  </div>
  <div id=\"tab-charts\" class=\"tab-content hidden\">
    <h2>Charts</h2>
    {charts_html}
  </div>
</body>
</html>
"""
    output_path.write_text(html, encoding="utf-8")
    return str(output_path)


# Convenience aliases matching __all__ for direct imports
capital_hist = Vizualizations.capital_hist
capital_hist_comparison = Vizualizations.capital_hist_comparison
capital_hist_comparison_suite = Vizualizations.capital_hist_comparison_suite
signals = Vizualizations.signals
signals_comparison = Vizualizations.signals_comparison
signals_comparison_suite = Vizualizations.signals_comparison_suite
save_figure = Vizualizations.save_figure
