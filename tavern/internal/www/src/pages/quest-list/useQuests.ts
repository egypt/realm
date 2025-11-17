import { useQuery } from "@apollo/client";
import { useCallback, useEffect,  useState } from "react";
import { TableRowLimit } from "../../utils/enums";
import { GET_QUEST_BY_ID_QUERY, GET_QUEST_QUERY } from "../../utils/queries";
import { getFilterNameByTypes } from "../../utils/utils";
import { Filters, useFilters } from "../../context/FilterContext";

export const useQuests = (pagination: boolean, id?: string) => {
    const [page, setPage] = useState<number>(1);
    const {filters} = useFilters();

    const constructDefaultQuery = useCallback((afterCursor?: string | undefined, beforeCursor?: string | undefined) => {
        const defaultRowLimit = TableRowLimit.QuestRowLimit;
        const query = {
          "where": {
            "and": [] as Array<any>
          },
          "whereTotalTask": {
            "and": [] as Array<any>
          },
          "whereFinishedTask": {
            "and": [
              {"execFinishedAtNotNil": true}
            ]
          },
          "whereOutputTask":{
            "and": [
              {"outputSizeGT": 0}
            ]
          },
          "whereErrorTask": {
            "and": [
              {"errorNotNil": true}
            ]
          },
          firstTask: 1,
          orderByTask: [{
            "direction": "DESC",
            "field": "LAST_MODIFIED_AT"
          }],
          "orderBy": [{
            "direction": "DESC",
            "field": "CREATED_AT"
          }]
        } as any;

        if(pagination){
          query.first = beforeCursor ? null : defaultRowLimit;
          query.last =  beforeCursor ? defaultRowLimit : null;
          query.after = afterCursor ? afterCursor : null;
          query.before = beforeCursor ? beforeCursor : null;
        }

        if(id){
          query.where.and = [{"id": id}];
        }

        return query
    },[pagination, id]);

    const constructBeaconFilterQuery = useCallback((query: any, beacons: any)=>{
      const fq = query;

      if(beacons.length > 0){
            const beaconList = {
              "hasBeaconWith": {"nameIn": beacons}
            };

            fq.where.and = fq.where.and.concat(
                {
                  "hasTasksWith": beaconList
                }
            );

            fq.whereFinishedTask.and = fq.whereFinishedTask.and.concat(
              beaconList
            );
            fq.whereOutputTask.and = fq.whereOutputTask.and.concat(
              beaconList
            );
            fq.whereErrorTask.and =fq.whereErrorTask.and.concat(
              beaconList
            );
            fq.whereTotalTask.and = fq.whereTotalTask.and.concat(
              beaconList
            );

      };
      return fq;
    },[])

    const constructTagFilterQuery = useCallback((query: any, tags: any, tagKind: string)=>{
      const fq = query;
      if(tags.length > 0){
        const tagList = {
          "hasBeaconWith": { "hasHostWith": {
            "hasTagsWith": {
              "and": [
                {"kind": tagKind},
                {"nameIn": tags}
              ]
            }
          }}
        };

        fq.where.and = fq.where.and.concat(
          {
            "hasTasksWith": tagList
          }
        );

        fq.whereFinishedTask.and = fq.whereFinishedTask.and.concat(
          tagList
        );
        fq.whereOutputTask.and = fq.whereOutputTask.and.concat(
          tagList
        );
        fq.whereErrorTask.and =fq.whereErrorTask.and.concat(
          tagList
        );
        fq.whereTotalTask.and = fq.whereTotalTask.and.concat(
          tagList
        );
      };
      return fq;
    },[]);

    const constructHostFilterQuery = useCallback((query: any, hosts: any)=>{
      const fq = query;

      if(hosts.length > 0){
        const hostsList = {
          "hasBeaconWith": {
            "hasHostWith": {"nameIn": hosts}
          }
        };
        fq.where.and = fq.where.and.concat(
          {
            "hasTasksWith": hostsList
          }
        );
        fq.whereFinishedTask.and = fq.whereFinishedTask.and.concat(
          hostsList
        );
        fq.whereOutputTask.and = fq.whereOutputTask.and.concat(
          hostsList
        );
        fq.whereErrorTask.and =fq.whereErrorTask.and.concat(
          hostsList
        );
        fq.whereTotalTask.and = fq.whereTotalTask.and.concat(
          hostsList
        );
    };
    return fq;

    },[]);

    const constructPlatformFilterQuery = useCallback((query: any, platforms: any)=>{
      const fq = query;
      const platformList = {
        "hasBeaconWith": {
          "hasHostWith": {
            "platformIn": platforms
          }
        }
      };

      if(platforms.length > 0){
        fq.where.and = fq.where.and.concat(
          {
            "hasTasksWith": platformList
          }
        );
        fq.whereFinishedTask.and = fq.whereFinishedTask.and.concat(
          platformList
        );
        fq.whereOutputTask.and = fq.whereOutputTask.and.concat(
          platformList
        );
        fq.whereErrorTask.and =fq.whereErrorTask.and.concat(
          platformList
        );
        fq.whereTotalTask.and = fq.whereTotalTask.and.concat(
          platformList
        );

      }
      return fq;
    },[]);

    const constructTaskOutputQuery = useCallback((query: any, taskOutput: any) => {
      const fq = query;

      if(taskOutput){
        fq.where.and = fq.where.and.concat({
          "hasTasksWith": {
            "outputContains": taskOutput
          }
        });
        fq.whereFinishedTask.and = fq.whereFinishedTask.and.concat({
          "outputContains": taskOutput
       });
        fq.whereOutputTask.and = fq.whereOutputTask.and.concat({
          "outputContains": taskOutput
        });
        fq.whereErrorTask.and =fq.whereErrorTask.and.concat({
          "outputContains": taskOutput
        });
        fq.whereTotalTask.and = fq.whereTotalTask.and.concat({
          "outputContains": taskOutput
        });
      }

      return fq;
    },[]);

    const constructQuestNameBasedQuery = useCallback((query: any, questName: string)=> {
      let fq = query;

      if(questName){
        fq.where.and = fq.where.and.concat({
          "nameContains": questName
        });
      }
      return fq;
    },[]);

    const constructFilterBasedQuery = useCallback((filters: Filters, currentQuery: any) => {
      if(!filters.filtersEnabled){
        return currentQuery;
      }

      let fq = currentQuery;
      const {beacon: beacons, group: groups, service: services, platform: platforms, host:hosts} = getFilterNameByTypes(filters.beaconFields);

      fq = constructQuestNameBasedQuery(fq, filters.questName);
      fq = constructBeaconFilterQuery(fq, beacons);
      fq = constructTagFilterQuery(fq, groups, "group");
      fq = constructTagFilterQuery(fq, services, "service");
      fq = constructHostFilterQuery(fq, hosts);
      fq = constructPlatformFilterQuery(fq, platforms);
      fq = constructTaskOutputQuery(fq, filters.taskOutput);

      return fq;
    },[
      constructBeaconFilterQuery,
      constructTagFilterQuery,
      constructHostFilterQuery,
      constructPlatformFilterQuery,
      constructTaskOutputQuery,
      constructQuestNameBasedQuery
    ]);


    const { loading, data, error, refetch } = useQuery(
      id ? GET_QUEST_BY_ID_QUERY : GET_QUEST_QUERY, {variables: constructDefaultQuery(),  notifyOnNetworkStatusChange: true}
      );

    const updateQuestList = useCallback((afterCursor?: string | undefined, beforeCursor?: string | undefined) => {
      const defaultQuery = constructDefaultQuery(afterCursor, beforeCursor);
      const queryWithFilter =  constructFilterBasedQuery(filters, defaultQuery) as any;
      refetch(queryWithFilter);
    },[filters, constructDefaultQuery, constructFilterBasedQuery, refetch]);

    useEffect(()=> {
      updateQuestList();
    },[updateQuestList]);

    useEffect(()=>{
      setPage(1);
    },[filters])

    return {
        data,
        loading,
        error,
        page,
        setPage,
        updateQuestList
    }
}
