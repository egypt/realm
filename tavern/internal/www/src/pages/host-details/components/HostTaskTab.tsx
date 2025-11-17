import { Link } from "react-router-dom";

import { EmptyState, EmptyStateType } from "../../../components/tavern-base-ui/EmptyState";
import TablePagination from "../../../components/tavern-base-ui/TablePagination";
import { TableRowLimit } from "../../../utils/enums";
import Button from "../../../components/tavern-base-ui/button/Button";
import TaskCard from "../../../features/task-card/TaskCard";
import { Task } from "../../../utils/consts";
import { useContext } from "react";
import { HostTaskContext } from "../../../context/HostTaskContext";
import FilterControls, { FilterPageType } from "../../../components/filter-controls";

const HostTaskTab = () => {
    const {
        data: taskData,
        loading: taskLoading,
        error: taskError,
        page,
        setPage,
        updateTaskList
    } = useContext(HostTaskContext);

    return (
        <div className="flex flex-col gap-2 mt-4">
            <div className="flex flex-row justify-end">
                {/* Sorting not added yet */}
                {/* <Button leftIcon={<Bars3BottomLeftIcon className="w-4" />} buttonVariant="ghost" buttonStyle={{ color: 'gray', size: "md" }} onClick={() => console.log("hi")}>Sort</Button> */}
                <FilterControls type={FilterPageType.HOST_TASK} />
            </div>
            {taskLoading ? (
                <EmptyState type={EmptyStateType.loading} label="Loading tasks..." />
            ) : taskError ? (
                <EmptyState type={EmptyStateType.error} label="Error loading tasks..." />
            ) : (
                <div>
                    {taskData?.tasks?.edges.length > 0 ? (
                        <>
                            <div className=" w-full flex flex-col gap-2 my-4">
                                {taskData.tasks.edges.map((task: { node: Task }) => {
                                    return (
                                        <TaskCard key={task.node.id} task={task.node} />
                                    )
                                })}
                            </div>
                            <TablePagination totalCount={taskData?.tasks?.totalCount} pageInfo={taskData?.tasks?.pageInfo} refetchTable={updateTaskList} page={page} setPage={setPage} rowLimit={TableRowLimit.TaskRowLimit} />
                        </>
                    )
                        : (
                            <EmptyState label="No data found" type={EmptyStateType.noData} details="Try creating a new quest or adjusting filters." >
                                <Link to="/createQuest">
                                    <Button
                                        buttonStyle={{ color: "purple", "size": "md" }}
                                        type="button"
                                    >
                                        Create new quest
                                    </Button>
                                </Link>
                            </EmptyState>
                        )}
                </div>
            )}
        </div>
    );
}
export default HostTaskTab;
