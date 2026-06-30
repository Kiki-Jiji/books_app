from dataclasses import dataclass


@dataclass
class DailySalesRecord:
    date: str
    royalty: float

@dataclass
class TitleDailySalesRecord:
    title: str
    records: list[DailySalesRecord]

@dataclass
class DayWeekSalesRecord:
    day: str
    royalty: float


@dataclass
class TitleDayWeekSalesRecord:
    title: str
    records: list[DayWeekSalesRecord]


@dataclass
class AdSpendRoyaltyRecord:
    date: str
    royalty: float
    ad_cost: float
    impressions: int
    clicks: int