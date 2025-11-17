import React, { createContext, Dispatch, SetStateAction } from "react";
import { useParams } from "react-router-dom";
import { useTasks } from "../hooks/useTasks";
import { DEFAULT_QUERY_TYPE } from "../utils/enums";

export type HostTaskContextQueryType = {
    data: undefined | any;
    loading: boolean;
    error: any;
    page: number,
    setPage: Dispatch<SetStateAction<number>>,
    updateTaskList: () => void
}

const defaultValue = {
    data: undefined,
    loading: false,
    error: false,
    page: 1,
    setPage: null,
    updateTaskList: null,
} as any;

export const HostTaskContext = createContext<HostTaskContextQueryType>(defaultValue);

export const HostTaskContextProvider = ({ children }: { children: React.ReactNode }) => {
    const { hostId } = useParams();

    const {
        data,
        loading,
        error,
        updateTaskList,
        page,
        setPage
    } = useTasks(DEFAULT_QUERY_TYPE.hostIDQuery, hostId);

    return (
        <HostTaskContext.Provider value={{ data, loading, error, updateTaskList, page, setPage }}>
            {children}
        </HostTaskContext.Provider>
    );
};
