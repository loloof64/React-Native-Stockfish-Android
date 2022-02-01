/**
 * Laurent Bernabe - 2021
 */

#include "lockedstringqueue.h"

bool loloof64::LockedStringQueue::empty() const {
    return this->_queue.empty();
}

std::string loloof64::LockedStringQueue::pullNext() {
    if (this->_mutex.try_lock()) {
        if (this->_queue.empty()) {
            this->_mutex.unlock();
            return "@@@Queue is empty@@@";
        }
        else {
            auto result = this->_queue.front();
            this->_queue.pop();

            this->_mutex.unlock();
            return result;
        }
    }
    else return "@@@Queue locked by another thread@@@";
}

void loloof64::LockedStringQueue::push(const std::string& element) {
    this->_mutex.lock();
    this->_queue.push(element);
    this->_mutex.unlock();
}