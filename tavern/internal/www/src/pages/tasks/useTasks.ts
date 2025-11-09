import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_QUERY_TYPE, TableRowLimit } from "../../utils/enums";
import { GET_TASK_QUERY } from "../../utils/queries";
import { getFilterNameByTypes } from "../../utils/utils";
import { Filters, useFilters } from "../../context/FilterContext";


export const useTasks = (defaultQuery?: DEFAULT_QUERY_TYPE, id?: string) => {
    const [page, setPage] = useState<number>(1);
    const {filters} = useFilters();

    const constructDefaultQuery = useCallback((searchText?: string, afterCursor?: string | undefined, beforeCursor?: string | undefined) => {
      const defaultRowLimit = TableRowLimit.TaskRowLimit;
      const query = {
        "where": {
          "and": [] as Array<any>
        },
        "first": beforeCursor ? null : defaultRowLimit,
        "last": beforeCursor ? defaultRowLimit : null,
        "after": afterCursor ? afterCursor : null,
        "before": beforeCursor ? beforeCursor : null,
        "orderBy": [{
          "direction": "DESC",
          "field": "LAST_MODIFIED_AT"
        }]
      } as any;

      switch(defaultQuery){
            case DEFAULT_QUERY_TYPE.hostIDQuery:
              const hostParams = [{
                  "hasBeaconWith": {
                      "hasHostWith": {
                          "id": id
                      }
                  }
              }] as Array<any>;

              if(searchText){
                hostParams.push({
                "or": [
                  {"outputContains": searchText},
                  {"hasQuestWith": {
                      "nameContains": searchText
                    }
                  },
                  {"hasQuestWith":
                    {"hasTomeWith": {"nameContains": searchText}}}
                ]
              })};

              query.where.and = hostParams;
              break;
            case DEFAULT_QUERY_TYPE.questIdQuery:
                const include = [{"hasQuestWith": {"id": id}}] as Array<any>;

                if(searchText){include.push({"outputContains": searchText})};

                query.where.and = include;
                break;
            case DEFAULT_QUERY_TYPE.questDetailsQuery:
            default:
                const text = searchText || "";
                query.where.and = [{
                                "or": [
                                  {"outputContains": text},
                                  {"hasQuestWith": {
                                      "nameContains": text
                                    }
                                  },
                                  {"hasQuestWith":
                                    {"hasTomeWith": {"nameContains": text}}}
                                ]
                }];
                break;
        }
        return query;
    },[defaultQuery, id]);

    const constructFilterBasedQuery = useCallback((filters: Filters, currentQuery: any) => {
      const fq = currentQuery;
      const {beacon: beacons, group: groups, service: services, platform: platforms, host:hosts} = getFilterNameByTypes(filters.beaconFields);

      if(beacons.length > 0){
            fq.where.and = fq.where.and.concat(
                {
                "hasBeaconWith": {"nameIn": beacons}
                }
            );
      }

      if(groups.length > 0){
          fq.where.and = fq.where.and.concat(
              {
                  "hasBeaconWith": { "hasHostWith": {
                    "hasTagsWith": {
                      "and": [
                        {"kind": "group"},
                        {"nameIn": groups}
                      ]
                    }
                  }}
              }
          );
      }

      if(services.length > 0){
          fq.where.and = fq.where.and.concat(
              {
                  "hasBeaconWith": { "hasHostWith": {
                    "hasTagsWith": {
                      "and": [
                        {"kind": "service"},
                        {"nameIn": services}
                      ]
                    }
                  }}
              }
          );
      }

      if(hosts.length > 0){
          fq.where.and = fq.where.and.concat(
              {
                  "hasBeaconWith": {
                    "hasHostWith": {"nameIn": hosts}
                  }
              }
          );
      }

      if(platforms.length > 0){
          fq.where.and = fq.where.and.concat(
              {
                  "hasBeaconWith": {
                    "hasHostWith": {
                      "platformIn": platforms
                    }
                  }
                }
          );
      }
      return fq;
    },[]);

    const { loading, error, data, refetch} = useQuery(GET_TASK_QUERY,  {variables: constructDefaultQuery(),  notifyOnNetworkStatusChange: true});

    const updateTaskList = useCallback((afterCursor?: string | undefined, beforeCursor?: string | undefined) => {
        const defaultQuery = constructDefaultQuery(filters.taskOutput, afterCursor, beforeCursor);
        const queryWithFilter =  constructFilterBasedQuery(filters, defaultQuery) as any;
        refetch(queryWithFilter);
    },[filters, constructDefaultQuery, constructFilterBasedQuery, refetch]);


    useEffect(()=> {
        updateTaskList();
    },[updateTaskList]);

    useEffect(()=>{
      setPage(1);
    },[filters])

    return {
        data,
        loading,
        error,
        page,
        setPage,
        updateTaskList
    }
};
