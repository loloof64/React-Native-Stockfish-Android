/**
 * Laurent Bernabe - 2021
 */

#ifndef __LOCKED_STRING_QUEUE_H
#define __LOCKED_STRING_QUEUE_H

#include <string>
#include <queue>
#include <mutex>

namespace loloof64 {
    class LockedStringQueue {
    public:
        ~LockedStringQueue() {
            this->_mutex.unlock();
        }
        bool empty() const;
        /*
         * Returns "@@@Queue locked by another thread@@@" if queue is locked by another thread,
         * else if no value available : "@@@Queue is empty@@@",
         * else the next data available in the queue.
         */
        std::string pullNext();
        void push(const std::string& element);
    private:
        std::queue<std::string> _queue;
        std::mutex _mutex;
    };
}
#endif