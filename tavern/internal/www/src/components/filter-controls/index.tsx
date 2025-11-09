import { useContext } from "react";
import { useFilters } from "../../context/FilterContext";
import { TagContext } from "../../context/TagContext";
import { BeaconFilterBar } from "../beacon-filter-bar";
import FreeTextSearch from "../tavern-base-ui/FreeTextSearch";
import { FilterControlWrapper } from "./FilterControlWrapper";

export enum FilterPageType {
    QUEST = 'Quest',
    HOST = 'Host',
    TASK = 'Task'
};

export default function FilterControls({ type }: { type: FilterPageType }) {
    const { filters, updateFilters } = useFilters();
    const { data } = useContext(TagContext);

    const getLabel = (): string => {
        let count = 0;

        switch (type) {
            case FilterPageType.QUEST:
                if (filters.questName !== "") count++;
                if (filters.taskOutput !== "") count++;
                if (filters.beaconFields.length > 0) count += filters.beaconFields.length;
                break;
            case FilterPageType.TASK:
                if (filters.taskOutput !== "") count++;
                if (filters.beaconFields.length > 0) count += filters.beaconFields.length;
                break;
            default:
                if (filters.beaconFields.length > 0) count += filters.beaconFields.length;
                break;
        }
        return `Filter (${count})`;
    };

    switch (type) {
        case FilterPageType.QUEST:
            return (
                <FilterControlWrapper label={getLabel()}>
                    <div className="flex flex-col gap-1">
                        <BeaconFilterBar
                            beacons={data?.beacons || []}
                            groups={data?.groupTags || []}
                            services={data?.serviceTags || []}
                            hosts={data?.hosts || []}
                            setFiltersSelected={(newValue) => updateFilters({ 'beaconFields': newValue })}
                            filtersSelected={filters.beaconFields}
                        />
                        <FreeTextSearch
                            defaultValue={filters.questName}
                            setSearch={(newValue) => updateFilters({ 'questName': newValue })}
                            placeholder="Search by quest"
                        />
                        <FreeTextSearch
                            defaultValue={filters.taskOutput}
                            setSearch={(newValue) => updateFilters({ 'taskOutput': newValue })}
                            placeholder="Search by output"
                        />
                    </div>
                </FilterControlWrapper>
            );
        case FilterPageType.TASK:
            return (
                <FilterControlWrapper label={getLabel()}>
                    <div className="flex flex-col gap-1">
                        <BeaconFilterBar
                            beacons={data?.beacons || []}
                            groups={data?.groupTags || []}
                            services={data?.serviceTags || []}
                            hosts={data?.hosts || []}
                            setFiltersSelected={(newValue) => updateFilters({ 'beaconFields': newValue })}
                            filtersSelected={filters.beaconFields}
                        />
                        <FreeTextSearch
                            defaultValue={filters.taskOutput}
                            setSearch={(newValue) => updateFilters({ 'taskOutput': newValue })}
                            placeholder="Search by output"
                        />
                    </div>
                </FilterControlWrapper>
            );
        case FilterPageType.HOST:
        default:
            return (
                <FilterControlWrapper label={getLabel()}>
                    <div>
                        <BeaconFilterBar
                            beacons={data?.beacons || []}
                            groups={data?.groupTags || []}
                            services={data?.serviceTags || []}
                            hosts={data?.hosts || []}
                            setFiltersSelected={(newValue) => updateFilters({ 'beaconFields': newValue })}
                            filtersSelected={filters.beaconFields}
                        />
                    </div>
                </FilterControlWrapper>
            );
    }
}
